<?php
require_once __DIR__ . '/../models/Resena.php';
class ResenaController{
    private $resenaModel;

    public function __construct(){
        $this->resenaModel = new Resena();
    }

    public function crearResena(int $usuario_id, int $contenido_id, int $puntuacion, string $comentario, DateTime $fecha_creacion){
        if(empty($contenido_id) || empty($puntuacion)){
            throw new Exception("La puntuacion y el contenido son obligatorios para crear una reseña");
        }
        if($puntuacion < 1 || $puntuacion > 5){
            throw new Exception("La puntuación debe estar entre 1 y 5");
        }
        if($this->resenaModel->existeResena($usuario_id, $contenido_id)){
            throw new Exception("Ya has reseñado este contenido. Edita tu reseña existente si deseas cambiar tu puntuación o comentario.");
        }
        return $this->resenaModel->crearResena($usuario_id, $contenido_id, $puntuacion, $comentario, $fecha_creacion);
    }

    public function obtenerTodasResenasDeUsuario(int $usuario_id){
        return $this->resenaModel->obtenerTodasResenasDeUsuario($usuario_id);
    }

    public function obtenerResenasPorPuntuacion(int $usuario_id, int $puntuacion){
        return $this->resenaModel->obtenerResenasPorPuntuacion($usuario_id, $puntuacion);
    }

    public function editarResena(int $id, int $usuario_id, int $contenido_id, int $puntuacion, string $comentario){
        if(empty($contenido_id) || empty($puntuacion)){
            throw new Exception("La puntuacion y el contenido son obligatorios para editar una reseña");
        }
        if($puntuacion < 1 || $puntuacion > 5){
            throw new Exception("La puntuación debe estar entre 1 y 5");
        }
        return $this->resenaModel->editarResena($id, $usuario_id, $contenido_id, $puntuacion, $comentario);
    }

    public function eliminarResena(int $id, int $usuario_id){
        return $this->resenaModel->eliminarResena($id, $usuario_id);
    }

    public function ultimasResenasDeUsuario(int $usuario_id, int $limite = 5){
        return $this->resenaModel->ultimasResenasDeUsuario($usuario_id, $limite);
    }
}