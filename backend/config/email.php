<?php
return [
    'host' => 'sandbox.smtp.mailtrap.io',
    'SMTPAuth' => true,
    'port' => 2525,
    'username' => '0fae24afc32b35',
    'password' => '02c749c2e06464',
    // configuracion de remitente, formato y destinatario.
    'from_email' => 'no-reply@rankialog.com',
    'from_name' => 'RankIA-Log',
    'isHTML' => true,
    'frontend_url' => 'http://localhost:4200' // URL del frontend para construir el enlace de verificación
];
?>