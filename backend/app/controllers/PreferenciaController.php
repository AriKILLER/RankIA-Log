<?php
require_once __DIR__ . '/../models/Preferencia.php';
class PreferenciaController{

    private $preferenciaModel;

    public function __construct(){
        $this->preferenciaModel = new Preferencia();
    }

    public function crearPreferenciaUsuario(int $usuario_id, int $id, string $tipo_preferido, string $duracion_preferida,
                                            string $max_temporadas, string $preferencia_popularidad){
        if(empty($usuario_id) || empty($id) || empty($tipo_preferido) || empty($duracion_preferida) || empty($max_temporadas) || empty($preferencia_popularidad)){
            throw new Exception("Todos los campos son obligatorios para crear una preferencia");
        }

        if(!in_array($tipo_preferido, ['pelicula', 'serie', 'ambos'])){
            throw new Exception("El tipo preferido debe ser 'pelicula', 'serie' o 'ambos'");
        }

        if(!in_array($duracion_preferida, ['corta', 'media', 'larga', 'indiferente'])){
            throw new Exception("La duracion preferida para peliculas debe ser 'corta', 'media' o 'larga' o 'indiferente' ");
        }

        if(!in_array($max_temporadas, ['1', '2-3', '4+', 'indiferente'])){
            throw new Exception("El maximo de temporadas preferida para series debe ser '1', '2-3', '4+' o 'indiferente'");
        }

        if(!in_array($preferencia_popularidad, ['popular', 'indiferente', 'menos_conocido'])){
            throw new Exception("La preferencia de popularidad debe ser 'popular', 'indiferente' o 'menos_conocido'");
        }

        return $this->preferenciaModel->crearPreferenciaUsuario($usuario_id, $id, $tipo_preferido, $duracion_preferida,
                                                                $max_temporadas, $preferencia_popularidad);    
    }

    public function obtenerPreferenciasPorUsuarioId(int $usuario_id){
        return $this->preferenciaModel->obtenerPreferenciasPorUsuarioId($usuario_id);
    }
}

?>