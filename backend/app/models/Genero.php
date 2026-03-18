<?php
require_once __DIR__ . '/../core/Model.php';
class Genero extends Model{

    public function obtenerGeneros(){
        $sql = "SELECT * FROM generos";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $generos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $generos ?: null;
    }    
    
    public function obtenerGenerosPorUsuarioId(int $usuario_id){
        $sql = "SELECT g.id, g.nombre FROM generos g
                JOIN usuario_generos ug ON g.id = ug.genero_id
                WHERE ug.usuario_id = :usuario_id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':usuario_id' => $usuario_id]);
        $generos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $generos ?: null;
    }

    public function guardarGenerosUsuario(int $usuario_id, array $generos_ids){
        if(!empty($generos_ids)){
            $sql = "INSERT INTO usuario_generos VALUES (:usuario_id, :genero_id)
                ON DUPLICATE KEY UPDATE usuario_id = usuario_id";
            $stmt = $this->db->prepare($sql);
            foreach ($generos_ids as $genero_id){
                $stmt->execute([
                    ':usuario_id' => $usuario_id,
                    ':genero_id' => $genero_id
                ]);
            }
        }else{
            throw new Exception("No se han seleccionado generos favoritos para el usuario");
        }
    }
}

