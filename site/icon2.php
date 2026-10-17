<?php
header('Content-Type: image/png');
header('Cache-Control: public, max-age=86400');
readfile(__DIR__ . '/icon-512.png');
