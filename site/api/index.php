<?php
require __DIR__ . '/lib.php';

$a = isset($_GET['a']) ? $_GET['a'] : '';

switch ($a) {

case 'me':
    if (!cfg()) out(array('ok' => true, 'installed' => false));
    out(array('ok' => true, 'installed' => true, 'user' => ($u = current_user()) ? user_json($u) : null));

case 'register': {
    check_post();
    $b = body();
    $email = clean_email(isset($b['email']) ? $b['email'] : '');
    $name = trim(isset($b['name']) ? (string)$b['name'] : '');
    $pw = isset($b['password']) ? (string)$b['password'] : '';
    if (!$email) fail('email_invalid');
    if ($name === '' || mb_strlen($name) > 80) fail('name_invalid');
    if (strlen($pw) < 8 || strlen($pw) > 200) fail('password_short');
    if (empty($b['consent'])) fail('consent');
    rate_limit('reg:' . client_ip(), 10, 3600);
    $pdo = db();
    $st = $pdo->prepare('SELECT id FROM pf_users WHERE email = ?');
    $st->execute(array($email));
    if ($st->fetch()) fail('email_taken', 409);
    $pdo->prepare('INSERT INTO pf_users (email, name, pass_hash, created_at, last_login) VALUES (?,?,?,?,?)')
        ->execute(array($email, $name, password_hash($pw, PASSWORD_DEFAULT), now(), now()));
    $id = (int)$pdo->lastInsertId();
    start_session();
    session_regenerate_id(true);
    $_SESSION['uid'] = $id;
    remember_issue($id);
    out(array('ok' => true, 'user' => array('id' => $id, 'email' => $email, 'name' => $name)));
}

case 'login': {
    check_post();
    $b = body();
    $email = clean_email(isset($b['email']) ? $b['email'] : '');
    $pw = isset($b['password']) ? (string)$b['password'] : '';
    if (!$email || $pw === '') fail('credentials', 401);
    rate_limit('login:' . client_ip() . ':' . $email, 8, 900);
    $st = db()->prepare('SELECT * FROM pf_users WHERE email = ?');
    $st->execute(array($email));
    $u = $st->fetch();
    if (!$u || !password_verify($pw, $u['pass_hash'])) fail('credentials', 401);
    db()->prepare('UPDATE pf_users SET last_login = ? WHERE id = ?')->execute(array(now(), $u['id']));
    start_session();
    session_regenerate_id(true);
    $_SESSION['uid'] = (int)$u['id'];
    remember_issue((int)$u['id']);
    out(array('ok' => true, 'user' => user_json($u)));
}

case 'logout':
    check_post();
    start_session();
    $_SESSION = array();
    session_destroy();
    remember_forget();
    out(array('ok' => true));

case 'save': {
    check_post();
    $u = require_user();
    $b = body();
    $activity = preg_replace('/[^a-z0-9_]/', '', strtolower(isset($b['activity']) ? (string)$b['activity'] : ''));
    $label = mb_substr(trim(isset($b['label']) ? (string)$b['label'] : ''), 0, 120);
    $score = isset($b['score']) ? (int)$b['score'] : -1;
    $total = isset($b['total']) ? (int)$b['total'] : 0;
    if ($activity === '' || $total < 1 || $total > 500 || $score < 0 || $score > $total) fail('invalid');
    $pdo = db();
    $pdo->prepare('INSERT INTO pf_results (user_id, activity, label, score, total, created_at) VALUES (?,?,?,?,?,?)')
        ->execute(array($u['id'], $activity, $label, $score, $total, now()));
    $mist = isset($b['mistakes']) && is_array($b['mistakes']) ? array_slice($b['mistakes'], 0, 60) : array();
    foreach ($mist as $m) {
        if (!is_array($m) || !isset($m['q']) || !isset($m['a'])) continue;
        $q = mb_substr((string)$m['q'], 0, 500);
        $ans = mb_substr((string)$m['a'], 0, 300);
        if ($q === '') continue;
        $key = sha1($activity . '|' . $q);
        $st = $pdo->prepare('SELECT id, times FROM pf_mistakes WHERE user_id = ? AND qkey = ?');
        $st->execute(array($u['id'], $key));
        $row = $st->fetch();
        if ($row) {
            $pdo->prepare('UPDATE pf_mistakes SET times = ?, last_at = ?, cleared = 0, a = ? WHERE id = ?')
                ->execute(array(min(999, (int)$row['times'] + 1), now(), $ans, $row['id']));
        } else {
            $pdo->prepare('INSERT INTO pf_mistakes (user_id, activity, qkey, q, a, times, last_at, cleared) VALUES (?,?,?,?,?,1,?,0)')
                ->execute(array($u['id'], $activity, $key, $q, $ans, now()));
        }
    }
    out(array('ok' => true));
}

case 'progress': {
    $u = require_user();
    $pdo = db();
    $st = $pdo->prepare('SELECT activity, COUNT(*) AS rounds, SUM(score) AS s, SUM(total) AS t, MAX(created_at) AS last_at FROM pf_results WHERE user_id = ? GROUP BY activity');
    $st->execute(array($u['id']));
    $acts = array();
    foreach ($st->fetchAll() as $r) {
        $acts[] = array('activity' => $r['activity'], 'rounds' => (int)$r['rounds'],
            'correct' => (int)$r['s'], 'total' => (int)$r['t'], 'last_at' => $r['last_at']);
    }
    $st = $pdo->prepare('SELECT id, activity, label, score, total, created_at FROM pf_results WHERE user_id = ? ORDER BY id DESC LIMIT 20');
    $st->execute(array($u['id']));
    $recent = $st->fetchAll();
    $st = $pdo->prepare('SELECT id, activity, q, a, times, last_at FROM pf_mistakes WHERE user_id = ? AND cleared = 0 ORDER BY last_at DESC, id DESC LIMIT 100');
    $st->execute(array($u['id']));
    $mist = $st->fetchAll();
    $st = $pdo->prepare('SELECT DISTINCT SUBSTR(created_at, 1, 10) AS d FROM pf_results WHERE user_id = ? ORDER BY d DESC LIMIT 60');
    $st->execute(array($u['id']));
    $days = array();
    foreach ($st->fetchAll() as $r) $days[] = $r['d'];
    $st = $pdo->prepare('SELECT activity, label, score, total, SUBSTR(created_at, 1, 10) AS d FROM pf_results WHERE user_id = ? ORDER BY id DESC LIMIT 800');
    $st->execute(array($u['id']));
    $rounds = array();
    foreach ($st->fetchAll() as $r) {
        $rounds[] = array('activity' => $r['activity'], 'label' => $r['label'], 'score' => (int)$r['score'], 'total' => (int)$r['total'], 'd' => $r['d']);
    }
    out(array('ok' => true, 'user' => user_json($u), 'activities' => $acts, 'recent' => $recent, 'mistakes' => $mist, 'days' => $days, 'rounds' => $rounds));
}

case 'clear': {
    check_post();
    $u = require_user();
    $b = body();
    if (!empty($b['all'])) {
        db()->prepare('UPDATE pf_mistakes SET cleared = 1 WHERE user_id = ?')->execute(array($u['id']));
    } else {
        db()->prepare('UPDATE pf_mistakes SET cleared = 1 WHERE user_id = ? AND id = ?')
            ->execute(array($u['id'], isset($b['id']) ? (int)$b['id'] : 0));
    }
    out(array('ok' => true));
}

case 'forgot': {
    check_post();
    $b = body();
    $email = clean_email(isset($b['email']) ? $b['email'] : '');
    if ($email) {
        rate_limit('forgot:' . client_ip(), 5, 3600);
        $st = db()->prepare('SELECT id, name FROM pf_users WHERE email = ?');
        $st->execute(array($email));
        if ($u = $st->fetch()) {
            $token = bin2hex(random_bytes(32));
            db()->prepare('INSERT INTO pf_resets (user_id, token_hash, expires_at, used) VALUES (?,?,?,0)')
                ->execute(array($u['id'], hash('sha256', $token), gmdate('Y-m-d H:i:s', time() + 3600)));
            $c = cfg();
            $base = rtrim(isset($c['site_url']) ? $c['site_url'] : '', '/');
            $link = $base . '/?reset=' . $token;
            $host = parse_url($base, PHP_URL_HOST);
            $from = 'noreply@' . preg_replace('/^www\./', '', $host ? $host : 'localhost');
            $msg = "Ciao " . $u['name'] . ",\n\nper scegliere una nuova password apri questo link (valido 1 ora):\n\n" . $link . "\n\nSe non l'hai chiesto tu, ignora questa email.\n\nPath to Fluency";
            @mail($email, '=?UTF-8?B?' . base64_encode('Reimposta la tua password') . '?=', $msg,
                "From: Path to Fluency <$from>\r\nContent-Type: text/plain; charset=UTF-8\r\nMIME-Version: 1.0");
        }
    }
    out(array('ok' => true)); // risposta uguale sia che l'email esista o no
}

case 'reset': {
    check_post();
    $b = body();
    $token = isset($b['token']) ? (string)$b['token'] : '';
    $pw = isset($b['password']) ? (string)$b['password'] : '';
    if (strlen($pw) < 8 || strlen($pw) > 200) fail('password_short');
    rate_limit('reset:' . client_ip(), 10, 3600);
    $st = db()->prepare('SELECT id, user_id FROM pf_resets WHERE token_hash = ? AND used = 0 AND expires_at > ?');
    $st->execute(array(hash('sha256', $token), now()));
    $r = $st->fetch();
    if (!$r) fail('token_invalid', 400);
    db()->prepare('UPDATE pf_users SET pass_hash = ? WHERE id = ?')->execute(array(password_hash($pw, PASSWORD_DEFAULT), $r['user_id']));
    db()->prepare('UPDATE pf_resets SET used = 1 WHERE user_id = ?')->execute(array($r['user_id']));
    out(array('ok' => true));
}

case 'delete': {
    check_post();
    $u = require_user();
    $b = body();
    $st = db()->prepare('SELECT pass_hash FROM pf_users WHERE id = ?');
    $st->execute(array($u['id']));
    $row = $st->fetch();
    if (!$row || !password_verify(isset($b['password']) ? (string)$b['password'] : '', $row['pass_hash'])) fail('credentials', 401);
    foreach (array('pf_results', 'pf_mistakes', 'pf_resets') as $t) {
        db()->prepare("DELETE FROM $t WHERE user_id = ?")->execute(array($u['id']));
    }
    db()->prepare('DELETE FROM pf_users WHERE id = ?')->execute(array($u['id']));
    start_session();
    $_SESSION = array();
    session_destroy();
    remember_forget();
    out(array('ok' => true));
}

default:
    fail('unknown', 404);
}
