<?php
$envPath = __DIR__ . '/../.env';
$env = file_exists($envPath) ? parse_ini_file($envPath, false, INI_SCANNER_RAW) : [];

$smtpAuth = filter_var($env['SMTP_AUTH'] ?? true, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
$isHtml = filter_var($env['SMTP_IS_HTML'] ?? true, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

return [
    'host' => $env['SMTP_HOST'] ?? 'smtp.gmail.com',
    'SMTPAuth' => $smtpAuth ?? true,
    'port' => (int)($env['SMTP_PORT'] ?? 587),
    'username' => $env['SMTP_USERNAME'] ?? '',
    'password' => $env['SMTP_PASSWORD'] ?? '',
    // configuracion de remitente, formato y destinatario.
    'from_email' => $env['SMTP_FROM_EMAIL'] ?? '',
    'from_name' => $env['SMTP_FROM_NAME'] ?? 'RankIA-Log',
    'isHTML' => $isHtml ?? true,
    'frontend_url' => $env['FRONTEND_URL'] ?? 'http://localhost:4200' // URL del frontend para construir el enlace de verificación
];
?>