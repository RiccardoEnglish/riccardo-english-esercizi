<?php
// Path to Fluency: libreria condivisa (compatibile PHP 7.4+)
error_reporting(E_ALL);
ini_set('display_errors', '0');

function cfg() {
    static $c = null;
    if ($c === null) {
        $f = __DIR__ . '/config.php';
        $c = is_file($f) ? require $f : null;
    }
    return $c;
}

function out($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail($msg, $code = 400) {
    out(array('ok' => false, 'error' => $msg), $code);
}

function db() {
    static $pdo = null;
    if ($pdo) return $pdo;
    $c = cfg();
    if (!$c) fail('not_installed', 503);
    try {
        if (isset($c['driver']) && $c['driver'] === 'sqlite') {
            $pdo = new PDO('sqlite:' . $c['sqlite_path']);
        } else {
            $pdo = new PDO(
                'mysql:host=' . $c['db_host'] . ';dbname=' . $c['db_name'] . ';charset=utf8mb4',
                $c['db_user'], $c['db_pass']
            );
        }
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        fail('db_error', 500);
    }
    return $pdo;
}

function schema_sql($driver) {
    $ai = $driver === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY';
    $tail = $driver === 'sqlite' ? '' : ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';
    $int = $driver === 'sqlite' ? 'INTEGER' : 'INT UNSIGNED';
    return array(
        "CREATE TABLE IF NOT EXISTS pf_users (
            id $ai,
            email VARCHAR(190) NOT NULL UNIQUE,
            name VARCHAR(80) NOT NULL,
            pass_hash VARCHAR(255) NOT NULL,
            created_at VARCHAR(19) NOT NULL,
            last_login VARCHAR(19) NULL
        )$tail",
        "CREATE TABLE IF NOT EXISTS pf_results (
            id $ai,
            user_id $int NOT NULL,
            activity VARCHAR(40) NOT NULL,
            label VARCHAR(120) NOT NULL,
            score SMALLINT NOT NULL,
            total SMALLINT NOT NULL,
            created_at VARCHAR(19) NOT NULL
        )$tail",
        "CREATE TABLE IF NOT EXISTS pf_mistakes (
            id $ai,
            user_id $int NOT NULL,
            activity VARCHAR(40) NOT NULL,
            qkey CHAR(40) NOT NULL,
            q TEXT NOT NULL,
            a TEXT NOT NULL,
            times SMALLINT NOT NULL DEFAULT 1,
            last_at VARCHAR(19) NOT NULL,
            cleared TINYINT NOT NULL DEFAULT 0,
            UNIQUE (user_id, qkey)
        )$tail",
        "CREATE TABLE IF NOT EXISTS pf_resets (
            id $ai,
            user_id $int NOT NULL,
            token_hash CHAR(64) NOT NULL,
            expires_at VARCHAR(19) NOT NULL,
            used TINYINT NOT NULL DEFAULT 0
        )$tail",
        "CREATE TABLE IF NOT EXISTS pf_attempts (
            id $ai,
            k VARCHAR(190) NOT NULL,
            at_ts $int NOT NULL
        )$tail",
        "CREATE INDEX pf_results_user ON pf_results (user_id, created_at)",
        "CREATE INDEX pf_attempts_k ON pf_attempts (k, at_ts)"
    );
}

function now() { return gmdate('Y-m-d H:i:s'); }

function body() {
    $raw = file_get_contents('php://input');
    $d = json_decode($raw, true);
    return is_array($d) ? $d : array();
}

function is_https() {
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
}

function start_session() {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('pf_sess');
    session_set_cookie_params(array(
        'lifetime' => 60 * 60 * 24 * 30,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Lax'
    ));
    ini_set('session.gc_maxlifetime', (string)(60 * 60 * 24 * 30));
    session_start();
}

// Protezione CSRF per le richieste che modificano dati
function check_post() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('method', 405);
    if (!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || $_SERVER['HTTP_X_REQUESTED_WITH'] !== 'fetch') fail('forbidden', 403);
    if (!empty($_SERVER['HTTP_ORIGIN'])) {
        $o = parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST);
        $h = preg_replace('/:\d+$/', '', isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '');
        if ($o !== $h) fail('forbidden', 403);
    }
}

// ---- Accesso ricordato (cookie firmato, valido 1 anno e rinnovato a ogni uso) ----
// Non richiede tabelle: il cookie contiene id utente e scadenza, firmati con un segreto
// del server e con un pezzo dell'hash della password (cambiando password, i cookie vecchi decadono).
define('PF_REM_COOKIE', 'pf_rem');
define('PF_REM_DAYS', 365);

function remember_secret() {
    $c = cfg();
    $parts = array(
        isset($c['db_pass']) ? $c['db_pass'] : '',
        isset($c['db_name']) ? $c['db_name'] : '',
        isset($c['db_user']) ? $c['db_user'] : '',
        isset($c['sqlite_path']) ? $c['sqlite_path'] : ''
    );
    return hash('sha256', 'pf-remember|' . implode('|', $parts));
}

function remember_sig($uid, $exp, $pass_hash) {
    return hash_hmac('sha256', $uid . '|' . $exp . '|' . substr((string)$pass_hash, -24), remember_secret());
}

function remember_set_cookie($value, $expires) {
    $opts = array('expires' => $expires, 'path' => '/', 'secure' => is_https(), 'httponly' => true, 'samesite' => 'Lax');
    if (PHP_VERSION_ID >= 70300) {
        @setcookie(PF_REM_COOKIE, $value, $opts);
    } else {
        @setcookie(PF_REM_COOKIE, $value, $expires, '/; samesite=Lax', '', is_https(), true);
    }
}

function remember_issue($uid) {
    $st = db()->prepare('SELECT pass_hash FROM pf_users WHERE id = ?');
    $st->execute(array($uid));
    $row = $st->fetch();
    if (!$row) return;
    $exp = time() + 60 * 60 * 24 * PF_REM_DAYS;
    $val = (int)$uid . '.' . $exp . '.' . remember_sig((int)$uid, $exp, $row['pass_hash']);
    remember_set_cookie($val, $exp);
    $_COOKIE[PF_REM_COOKIE] = $val;
}

function remember_forget() {
    remember_set_cookie('', time() - 3600);
    unset($_COOKIE[PF_REM_COOKIE]);
}

// Se la sessione è sparita ma il cookie è valido, riapre la sessione.
function remember_restore() {
    if (empty($_COOKIE[PF_REM_COOKIE])) return false;
    $p = explode('.', (string)$_COOKIE[PF_REM_COOKIE]);
    if (count($p) !== 3) return false;
    $uid = (int)$p[0]; $exp = (int)$p[1];
    if ($uid < 1 || $exp < time()) return false;
    $st = db()->prepare('SELECT id, pass_hash FROM pf_users WHERE id = ?');
    $st->execute(array($uid));
    $row = $st->fetch();
    if (!$row) return false;
    if (!hash_equals(remember_sig($uid, $exp, $row['pass_hash']), (string)$p[2])) return false;
    session_regenerate_id(true);
    $_SESSION['uid'] = $uid;
    return true;
}

function current_user() {
    start_session();
    if (empty($_SESSION['uid'])) {
        if (!remember_restore()) return null;
    }
    $st = db()->prepare('SELECT id, email, name FROM pf_users WHERE id = ?');
    $st->execute(array($_SESSION['uid']));
    $u = $st->fetch();
    if (!$u) return null;
    // rinnova il cookie quando mancano meno di 360 giorni alla scadenza (o se manca)
    $need = true;
    if (!empty($_COOKIE[PF_REM_COOKIE])) {
        $p = explode('.', (string)$_COOKIE[PF_REM_COOKIE]);
        if (count($p) === 3 && (int)$p[1] - time() > 60 * 60 * 24 * 360 && (int)$p[0] === (int)$u['id']) $need = false;
    }
    if ($need) remember_issue((int)$u['id']);
    return $u;
}

function require_user() {
    $u = current_user();
    if (!$u) fail('auth', 401);
    return $u;
}

function client_ip() {
    return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0';
}

// Limite di tentativi: $max richieste ogni $window secondi per chiave
function rate_limit($key, $max, $window) {
    $pdo = db();
    $t = time();
    $pdo->prepare('DELETE FROM pf_attempts WHERE at_ts < ?')->execute(array($t - 86400));
    $st = $pdo->prepare('SELECT COUNT(*) AS n FROM pf_attempts WHERE k = ? AND at_ts > ?');
    $st->execute(array($key, $t - $window));
    $n = (int)$st->fetch()['n'];
    if ($n >= $max) fail('rate_limited', 429);
    $pdo->prepare('INSERT INTO pf_attempts (k, at_ts) VALUES (?, ?)')->execute(array($key, $t));
}

function clean_email($e) {
    $e = strtolower(trim((string)$e));
    return filter_var($e, FILTER_VALIDATE_EMAIL) && strlen($e) <= 190 ? $e : null;
}

function user_json($u) {
    return array('id' => (int)$u['id'], 'email' => $u['email'], 'name' => $u['name']);
}
