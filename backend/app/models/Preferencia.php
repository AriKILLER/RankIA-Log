<?php
require_once __DIR__ . '/../core/Model.php';
class Preferencia extends Model{

    public function crearPreferenciaUsuario(int $usuario_id, int $id, string $tipo_preferido, string $duracion_preferida, 
                                            string $max_temporadas, string $preferencia_popularidad){
        
        $sql = "INSERT INTO preferencias_usuario (usuario_id, id, tipo_preferido, duracion_preferida, max_temporadas, preferencia_popularidad)
        VALUES (:usuario_id, :id, :tipo_preferido, :duracion_preferida, :max_temporadas, :preferencia_popularidad)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':usuario_id' => $usuario_id,
            ':id' => $id,
            ':tipo_preferido' => $tipo_preferido,
            ':duracion_preferida' => $duracion_preferida,
            ':max_temporadas' => $max_temporadas,
            ':preferencia_popularidad' => $preferencia_popularidad
        ]);

        return $this->db->lastInsertId();
        
    }

    public function obtenerPreferenciasPorUsuarioId(int $usuario_id){
        $sql = "SELECT * FROM preferencias_usuario WHERE usuario_id = :usuario_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':usuario_id' => $usuario_id]);
        $preferencias = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $preferencias ?: null;
    }


}

?>