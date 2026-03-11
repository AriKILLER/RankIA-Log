<?php
// Esta clase se encarga de manejar la autenticacion de los usuarios cuando se registran o inician sesion.
// Utiliza la clase Usuario para interactuar con la base de datos y realizar operaciones relacionadas con los usuarios, como crear
// o buscar un usuario por su correo electrónico, lo que permite verificar las credenciales de los usuarios durante el proceso de inicio de sesión.
require_once __DIR__ . '/../models/Usuario.php';
class AutenticacionController{
    private $usuarioModel;

    public function __construct(){
        $this->usuarioModel = new Usuario();
    }

    // El método registroUsuario se encarga de registrar un nuevo usuario en el sistema. Verifica si el correo electrónico ya está registrado y, si no lo está, crea un nuevo usuario utilizando la clase Usuario.
    public function registroUsuario(String $nombre, String $email, String $password, DateTime $fecha_registro){
        if($this->usuarioModel->buscarPorEmail($email)){
            throw new Exception("El correo electrónico ya está registrado. Inicie sesion o utilice otro correo.");
        }else{
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            return $this->usuarioModel->crearUsuario($nombre, $email, $password_hash, $fecha_registro);
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
}

?>
