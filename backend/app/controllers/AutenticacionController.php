<?php
// Esta clase se encarga de manejar la autenticacion de los usuarios cuando se registran o inician sesion.
// Utiliza la clase Usuario para interactuar con la base de datos y realizar operaciones relacionadas con los usuarios, como crear
// o buscar un usuario por su correo electrónico, lo que permite verificar las credenciales de los usuarios durante el proceso de inicio de sesión.
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../middleware/Autenticacion.php';
require_once __DIR__ . '/../services/EmailService.php';
require_once __DIR__ . '/../models/UsuarioToken.php';
require_once __DIR__ . '/../models/Lista.php';
class AutenticacionController{
    private $usuarioModel;
    private $autenticacionMiddleware;
    private $emailService;
    private $usuarioTokenModel;
    private $listaModel;

    public function __construct(){
        $this->usuarioModel = new Usuario();
        $this->autenticacionMiddleware = new Autenticacion();
        $this->emailService = new EmailService();
        $this->usuarioTokenModel = new UsuarioToken();
        $this->listaModel = new Lista();
    }

    // El método registroUsuario se encarga de registrar un nuevo usuario en el sistema. Verifica si el correo electrónico ya está registrado y, si no lo está, crea un nuevo usuario utilizando la clase Usuario.
    public function registroUsuario(String $nombre, String $email, String $password, DateTime $fecha_registro): int{
        if($this->usuarioModel->buscarPorEmail($email)){
            throw new Exception("Correo electronico ya registrado. Por favor, intente con otro correo o inicie sesion.");
        }else{
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            $usuario_id = (int)$this->usuarioModel->crearUsuario($nombre, $email, $password_hash, $fecha_registro);
            
            $this->emailService->enviarCorreoVerificacion($email, $token = $this->usuarioTokenModel->crearToken($usuario_id, (new DateTime())->modify('+3 day')));
            $this->listaModel->listasPredefinidas($usuario_id);
            $this->autenticacionMiddleware->crearSesion($usuario_id, $email);
            
            return $usuario_id;
        }
    }

    // El método inicioSesion se encarga de iniciar sesión para un usuario existente. Verifica si el correo electrónico está registrado y, si lo está, 
    // compara la contraseña proporcionada con el hash de la contraseña almacenada en la base de datos utilizando password_verify. Si las credenciales son correctas, 
    // devuelve los datos del usuario; de lo contrario, lanza una excepción con un mensaje de error.
    public function inicioSesion(String $email, String $password){
        $usuario = $this->usuarioModel->buscarPorEmail($email);
        if(!$usuario){
            throw new Exception("Correo electronico no registrado. Por favor, registrese primero o compruebe su correo.");
        }else{
            if(password_verify($password, $usuario['password_hash'])){
                return $usuario;
            }else{
                throw new Exception("Contraseña introducida incorrecta. Por favor, intente de nuevo.");
            }
        }
    }

    public function cerrarSesion(){
        $this->autenticacionMiddleware->verificarCierreSesion();
    }

    public function obtenerUsuarioPorId(int $usuario_id){
        $usuario = $this->usuarioModel->buscarPorId($usuario_id);

        if(!$usuario){
            throw new Exception("Usuario no encontrado. Por favor, verifique su sesión o intente de nuevo.");
        }

        unset($usuario['password_hash']);
        return $usuario;
    }

    public function verificarCorreo(string $token): void{
    $usuario_id = $this->usuarioTokenModel->obtenerUsuarioIdPorToken($token);

    if(!$usuario_id){
        throw new Exception("Token de verificación no válido o expirado.");
    }

    $verificado = $this->usuarioModel->verificarEmail($usuario_id);
    if(!$verificado){
        throw new Exception("No se pudo marcar el correo como verificado.");
    }

    $usado = $this->usuarioTokenModel->tokenUtilizado($token);
    if(!$usado){
        throw new Exception("No se pudo marcar el token como utilizado.");
    }
}
}    
?>
