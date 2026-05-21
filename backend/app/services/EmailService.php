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

  public function enviarCorreoRecuperacion(string $destinatario, string $token){
    $frontendUrl = $this->emailConfig['frontend_url'];
    $enlace = $frontendUrl . '/reset-password?token=' . urlencode($token);
    $this->phpmailer->clearAddresses();
    $asunto = "Recuperación de contraseña en RankIA-Log";
    $cuerpo = "<body style=\"margin:0;padding:0;background-color:#0d0d0d;font-family:'Segoe UI',Arial,sans-serif;\">
  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#0d0d0d;padding:40px 20px;\">
    <tr>
      <td align=\"center\">
        <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:520px;background-color:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;overflow:hidden;\">

          <!-- Header -->
          <tr>
            <td style=\"background-color:#e63946;padding:6px 0;\"></td>
          </tr>
          <tr>
            <td align=\"center\" style=\"padding:40px 40px 24px 40px;\">
              <h1 style=\"margin:0;font-size:2rem;letter-spacing:4px;color:#ffffff;font-family:'Arial Black',Arial,sans-serif;\">
                RANK<span style=\"color:#e63946;\">IA</span> LOG
              </h1>
              <p style=\"margin:8px 0 0 0;font-size:0.8rem;color:#888888;letter-spacing:0.1em;text-transform:uppercase;\">
                Tu diario de contenido audiovisual
              </p>
            </td>
          </tr>

          <!-- Icon -->
          <tr>
            <td align=\"center\" style=\"padding:0 40px 16px 40px;\">
              <div style=\"font-size:3rem;\">🔐</div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align=\"center\" style=\"padding:0 40px 16px 40px;\">
              <h2 style=\"margin:0;font-size:1.5rem;letter-spacing:2px;color:#ffffff;font-family:'Arial Black',Arial,sans-serif;\">
                RECUPERA TU <span style=\"color:#e63946;\">CONTRASEÑA</span>
              </h2>
            </td>
          </tr>
<!-- Body -->
          <tr>
            <td style=\"padding:0 40px 32px 40px;\">
              <p style=\"margin:0 0 16px 0;font-size:0.95rem;color:#cccccc;line-height:1.7;text-align:center;\">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>
              <p style=\"margin:0 0 32px 0;font-size:0.85rem;color:#888888;line-height:1.6;text-align:center;\">
                Si no has solicitado este cambio, puedes ignorar este correo. Tu contraseña no será modificada.
              </p>
              <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">
                <tr>
                  <td align=\"center\">
                    <a href=\"{{RESET_URL}}\"
                       style=\"display:inline-block;background-color:#e63946;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:6px;font-family:'Arial Black',Arial,sans-serif;font-size:1rem;letter-spacing:2px;text-transform:uppercase;\">
                      RESTABLECER CONTRASEÑA
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Token info -->
          <tr>
            <td style=\"padding:0 40px 32px 40px;\">
              <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#111111;border:1px solid #2a2a2a;border-radius:6px;\">
                <tr>
                  <td style=\"padding:16px 20px;\">
                    <p style=\"margin:0 0 4px 0;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:#888888;\">
                      ⏱ Este enlace expira en
                    </p>
                    <p style=\"margin:0;font-size:0.95rem;color:#ffffff;font-weight:600;\">
                      3 días
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
<!-- Footer -->
          <tr>
            <td style=\"background-color:#111111;border-top:1px solid #2a2a2a;padding:20px 40px;text-align:center;\">
              <p style=\"margin:0;font-size:0.78rem;color:#666666;line-height:1.6;\">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                <span style=\"color:#e63946;word-break:break-all;\">{{RESET_URL}}</span>
              </p>
              <p style=\"margin:12px 0 0 0;font-size:0.75rem;color:#444444;\">
                © RankIA Log · Proyecto Fin de Ciclo DAW
              </p>
            </td>
          </tr>

          <!-- Bottom bar -->
          <tr>
            <td style=\"background-color:#e63946;padding:4px 0;\"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>";
$cuerpo = str_replace('{{RESET_URL}}', $enlace, $cuerpo);
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