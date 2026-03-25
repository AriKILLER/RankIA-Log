<?php
return [
    'tmdb' => [
        'url' => 'https://api.themoviedb.org/3',
        'api_key' => getenv('TMDB_API_KEY') ?: '',
        'token_acceso' => getenv('TMDB_TOKEN') ?: '',
        'idioma' => 'es-ES',
    ],
];