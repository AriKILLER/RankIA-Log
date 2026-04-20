<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService{
    private $phpmailer;
    private $emailConfig;

    public function __construct(){
        $this->phpmailer = new PHPMailer(true);
        $this->emailConfig = require __DIR__ . '/../../config/email.php';
        $this->phpmailer->Host = $this->emailConfig['host'];
        $this->phpmailer->isSMTP();
      $this->phpmailer->CharSet = 'UTF-8';
      $this->phpmailer->Encoding = 'base64';
        $this->phpmailer->SMTPAuth = $this->emailConfig['SMTPAuth'];
        $this->phpmailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->phpmailer->Port = $this->emailConfig['port'];
        $this->phpmailer->Username = $this->emailConfig['username'];
        $this->phpmailer->Password = $this->emailConfig['password'];
        $this->phpmailer->setFrom($this->emailConfig['from_email'], $this->emailConfig['from_name']);
        $this->phpmailer->isHTML($this->emailConfig['isHTML']);
    }
// cuando esto este acabado, en registro de usuario si el usuario se registra correctamente se tendra que llamar a este metodo para enviar el correo de verificacion al usuario
    public function enviarCorreoVerificacion(string $destinatario, string $token){
      $frontendUrl = $this->emailConfig['frontend_url'];
      $enlace = $frontendUrl . '/verify-email?token=' . urlencode($token);
        $this->phpmailer->clearAddresses();
        $asunto = "Verificación de cuenta en RankIA-Log";
        $cuerpo = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d0d; padding: 0;\">

  <!-- header -->
  <div style=\"background-color: #111111; padding: 32px 40px; border-bottom: 2px solid #e63946; text-align: center;\">
    <h1 style=\"margin: 0; font-size: 36px; letter-spacing: 3px; color: #ffffff;\">
      RANKIA<span style=\"color: #e63946;\">LOG</span>
    </h1>
    <p style=\"margin: 6px 0 0 0; font-size: 13px; color: #888888; letter-spacing: 1px;\">
      TU DIARIO DE PELÍCULAS Y SERIES
    </p>
  </div>

  <!-- bodyy -->
  <div style=\"background-color: #1a1a1a; padding: 40px;\">

    <p style=\"margin: 0 0 16px 0; font-size: 15px; color: #aaaaaa; line-height: 1.6;\">
      Hola,
    </p>

    <p style=\"margin: 0 0 24px 0; font-size: 15px; color: #aaaaaa; line-height: 1.6;\">
      Gracias por registrarte en RankIA-Log. Para completar tu registro, por favor haz clic en el siguiente enlace para verificar tu cuenta:
    </p>

    <!-- boton -->
    <div style=\"text-align: center; padding-bottom: 28px;\">
      <a href=\"$enlace\"
        style=\"display: inline-block; background-color: #e63946; color: #ffffff; text-decoration: none;
               font-size: 16px; letter-spacing: 2px; font-weight: bold;
               padding: 14px 40px; border-radius: 8px; text-transform: uppercase;\">
        VERIFICAR MI CUENTA
      </a>
    </div>
<!-- enlace alternativo -->
    <p style=\"margin: 0 0 6px 0; font-size: 13px; color: #666666; text-align: center;\">
      Si el botón no funciona, copia y pega este enlace en tu navegador:
    </p>
    <p style=\"margin: 0 0 28px 0; font-size: 12px; color: #e63946; text-align: center; word-break: break-all;\">
      <a href=\"$enlace\" target=\"_blank\">Enlace de verificación: $enlace</a>
    </p>

    <!-- separador -->
    <div style=\"height: 1px; background-color: #2a2a2a; margin: 0 0 24px 0;\"></div>

    <!-- aviso -->
    <div style=\"background-color: rgba(230,57,70,0.07); border-left: 3px solid #e63946; border-radius: 4px; padding: 14px 18px; margin-bottom: 24px;\">
      <p style=\"margin: 0; font-size: 13px; color: #aaaaaa; line-height: 1.6;\">
        Si no te registraste en RankIA-Log, por favor ignora este correo.
      </p>
    </div>

    <!-- firma -->
    <p style=\"margin: 0; font-size: 14px; color: #aaaaaa; line-height: 1.6;\">
      Saludos,<br>
      <strong style=\"color: #ffffff;\">El equipo de RankIA-Log</strong>
    </p>

  </div>

  <!-- footer -->
  <div style=\"background-color: #111111; padding: 24px 40px; border-top: 1px solid #2a2a2a; text-align: center;\">
    <p style=\"margin: 0 0 6px 0; font-size: 12px; color: #555555;\">
      © 2026 RankIA Log · Todos los derechos reservados
    </p>
    <p style=\"margin: 0; font-size: 12px; color: #555555;\">
      Este es un correo automático, por favor no respondas a este mensaje.
    </p>
  </div>

</div>";
        try{
            $this->phpmailer->addAddress($destinatario);
            $this->phpmailer->Subject = $asunto;
            $this->phpmailer->Body = $cuerpo;
            if($this->phpmailer->send()){
                return true;
            }
        }catch (Exception $e){
            return false;
        }
    }
    
}