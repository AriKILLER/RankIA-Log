<?php
class Autenticacion {
    public function verificarSesion(){
        if(!isset($_SESSION['usuario_id'])){
            throw new Exception('Usuario no autenticado');
        }
    }

    public function verificarCierreSesion(){
        if(!isset($_SESSION['usuario_id'])){
            throw new Exception('Usuario no autenticado');
        }else{
            session_unset();
            session_destroy();
            echo json_encode(['success' => true, 'message' => 'Sesion cerrada exitosamente']);
        }
    }
}