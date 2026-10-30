# Path to Fluency · Riccardo English Esercizi

Web app di esercizi di inglese per italiani, online su pathtofluency.it. Una pagina unica (single-page app) con 97 argomenti guidati (A1-C1), argomenti dedicati (preposizioni, phrasal verbs, get, Past Simple, Present Perfect, modali, verbi irregolari) e area account in PHP + MySQL.

## Cartelle

- `site/` : la versione pubblicata. `index.html` è generato; `api/` è il backend PHP; icone e `manifest.webmanifest`.
- `src/` : il sorgente. `prepositions-lab.html` (app), `a1/` (motore `engine.js`, vista `view.html`, contenuti `data*.js`), `a1/inject.py` e `build_site.py` (assemblaggio).
- `export/a1-contenuti.json` : guide, tabelle, errori tipici e domande degli argomenti guidati, in JSON.
- `server/` : modelli dei due file che stanno solo sul server e non vanno pubblicati con i dati veri: `deploy.php.example` e `config.php.example`.

## Costruire il sito

1. Modifica i contenuti in `src/a1/data*.js` (o il motore in `engine.js`).
2. `python3 src/a1/inject.py` inserisce motore e dati nell'app. `python3 src/build_site.py` crea `site/index.html`.
   Gli script hanno percorsi assoluti `/home/claude/build/...` in testa al file: adattali alla tua cartella.
3. Copia i file aggiornati in `site/` e `src/`, fai commit e push su `main`.

Ordine dei file dati: vengono uniti in ordine alfabetico; `data9.js` ordina gli argomenti e deve restare ultimo.

## Formato di un argomento

Oggetto in `A1_TOPICS` con `id` (`a1-`, `a2-`, `b1-`, `b2-`, `c1-`), `level`, `tag`, `title`, `desc`, `lead`, `tip`, `blocks` (sezioni e tabelle), `traps` e `qs`.

- Scelta multipla: `["mc", testo, [opzioni], indiceCorretta, spiegazione]`
- Completamento: `["t", testo con un solo ___, [risposte accettate], spiegazione]`
- Errore tipico (`traps`): `[frase sbagliata, frase corretta, spiegazione]`. Differiscono per una sola parola.

Ogni esercizio deve avere almeno 10 domande; un argomento è completo con l'80% di risposte giuste in due giorni diversi.

## Pubblicare sul server

Sul server c'è `deploy.php` (modello in `server/deploy.php.example`, con una chiave segreta da scegliere). Aprendo `/deploy.php?k=LA_CHIAVE` scarica da questo repository i file elencati in `$files` (compresi `index.html` e i PHP di `api/`), li controlla e li sostituisce; se un controllo fallisce non cambia nulla. Se si aggiunge un file da pubblicare, va aggiunto a quell'elenco.

## Backend

`site/api/lib.php` e `index.php`: registrazione, login, progressi. Le tabelle si creano da sole al primo uso. I dati del database stanno in `api/config.php` sul server (modello in `server/config.php.example`). Il login resta attivo grazie a un cookie firmato (`pf_rem`, 365 giorni) oltre alla sessione PHP.
