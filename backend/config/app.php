<?php
$envPath = __DIR__ . '/../.env';
$env = file_exists($envPath) ? parse_ini_file($envPath, false, INI_SCANNER_RAW) : []; 
return [
    'tmdb' => [
        'url' => $env['TMDB_URL'] ?? 'https://api.themoviedb.org/3',
        'api_key' => $env['TMDB_API_KEY'] ?? '',
        'token_acceso' => $env['TMDB_TOKEN'] ?? '',
        'idioma' => $env['TMDB_LANG'] ?? 'es-ES',
    ],
];
?>
