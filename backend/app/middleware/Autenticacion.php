<?php
class Autenticacion {

    public function crearSesion(int $usuario_id, string $email): void{
        session_regenerate_id(true);
        $_SESSION['usuario_id'] = $usuario_id;
        $_SESSION['usuario_email'] = $email;
    }

    public function verificarSesion(): void{
        if(!isset($_SESSION['usuario_id']) || session_status() !== PHP_SESSION_ACTIVE){
            throw new Exception('Usuario no autenticado');
        }
    }

    public function verificarCierreSesion(): void{
        if(!isset($_SESSION['usuario_id']) || session_status() !== PHP_SESSION_ACTIVE){
            throw new Exception('Usuario no autenticado');
        }

        $_SESSION = [];

        if(ini_get('session.use_cookies')){
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        session_destroy();
    }
}