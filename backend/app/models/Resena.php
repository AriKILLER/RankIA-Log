<?php
require_once __DIR__ . '/../core/Model.php';
class Resena extends Model{

    public function crearResena(int $usuario_id, int $contenido_id, int $puntuacion, string $comentario, DateTime $fecha_creacion){
        if(empty($contenido_id) || empty($puntuacion)){
            throw new Exception("La puntuacion y el contenido son obligatorios para crear una reseña");
        }
        if($puntuacion < 1 || $puntuacion > 5){
            throw new Exception("La puntuación debe estar entre 1 y 5");
        }
        $sql = "INSERT INTO resenas (usuario_id, contenido_id, puntuacion, comentario, fecha_creacion) VALUES (:usuario_id, :contenido_id, :puntuacion, :comentario, :fecha_creacion)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':usuario_id' => $usuario_id,
            ':contenido_id' => $contenido_id,
            ':puntuacion' => $puntuacion,
            ':comentario' => $comentario,
            ':fecha_creacion' => $fecha_creacion->format('Y-m-d H:i:s')
        ]);
        return $this->db->lastInsertId();
    }

    public function obtenerTodasResenasDeUsuario(int $usuario_id){
        $sql = "SELECT r.*, u.nombre AS nombre_usuario, c.external_id AS external_id, c.titulo AS titulo_contenido, c.poster AS poster_contenido, c.tipo AS tipo_contenido FROM resenas r JOIN usuarios u ON r.usuario_id = u.id JOIN contenidos c ON r.contenido_id = c.id WHERE r.usuario_id = :usuario_id ORDER BY r.fecha_creacion DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':usuario_id' => $usuario_id]);
        $resenas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $resenas ?: [];
    }

    public function obtenerResenasPorPuntuacion(int $usuario_id, int $puntuacion){
        $sql = "SELECT r.*, u.nombre AS nombre_usuario, c.external_id AS external_id, c.titulo AS titulo_contenido, c.poster AS poster_contenido, c.tipo AS tipo_contenido FROM resenas r JOIN usuarios u ON r.usuario_id = u.id JOIN contenidos c ON r.contenido_id = c.id WHERE r.usuario_id = :usuario_id AND r.puntuacion = :puntuacion ORDER BY r.fecha_creacion DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':usuario_id' => $usuario_id,
            ':puntuacion' => $puntuacion
        ]);
        $resenas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $resenas ?: [];
    }

    public function obtenerResenaPorId(int $id){
        $sql = "SELECT r.*, u.nombre AS nombre_usuario, c.external_id AS external_id, c.titulo AS titulo_contenido, c.poster AS poster_contenido, c.tipo AS tipo_contenido FROM resenas r JOIN usuarios u ON r.usuario_id = u.id JOIN contenidos c ON r.contenido_id = c.id WHERE r.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $resena = $stmt->fetch(PDO::FETCH_ASSOC);
        return $resena ?: null;
    }

    public function obtenerResenaPorIdDeUsuario(int $id, int $usuario_id){
        $sql = "SELECT r.*, u.nombre AS nombre_usuario, c.external_id AS external_id, c.titulo AS titulo_contenido, c.poster AS poster_contenido, c.tipo AS tipo_contenido FROM resenas r JOIN usuarios u ON r.usuario_id = u.id JOIN contenidos c ON r.contenido_id = c.id WHERE r.id = :id AND r.usuario_id = :usuario_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':id' => $id,
            ':usuario_id' => $usuario_id
        ]);
        $resena = $stmt->fetch(PDO::FETCH_ASSOC);
        return $resena ?: null;
    }

    public function editarResena(int $id, int $usuario_id, int $contenido_id, int $puntuacion, string $comentario){
        $sql = "UPDATE resenas SET puntuacion = :puntuacion, comentario = :comentario WHERE id = :id AND usuario_id = :usuario_id AND contenido_id = :contenido_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':id' => $id,
            ':usuario_id' => $usuario_id,
            ':contenido_id' => $contenido_id,
            ':puntuacion' => $puntuacion,
            ':comentario' => $comentario
        ]);
        if($stmt->rowCount() === 0){
            // Si no hay cambios, MySQL puede devolver 0 filas afectadas. Verificamos propiedad/existencia.
            $resenaExistente = $this->obtenerResenaPorIdDeUsuario($id, $usuario_id);
            if(!$resenaExistente || (int)$resenaExistente['contenido_id'] !== $contenido_id){
                throw new Exception("No se encontró la reseña para actualizar.");
            }
            return $resenaExistente;
        }

        $resenaActualizada = $this->obtenerResenaPorIdDeUsuario($id, $usuario_id);
        return $resenaActualizada;
    }

    public function eliminarResena(int $id, int $usuario_id){
        $sql = "DELETE FROM resenas WHERE id = :id AND usuario_id = :usuario_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':id' => $id,
            ':usuario_id' => $usuario_id
        ]);
        return $stmt->rowCount() > 0;
    }

    public function existeResena(int $usuario_id, int $contenido_id): bool{
        $sql = "SELECT 1 FROM resenas WHERE usuario_id = :usuario_id AND contenido_id = :contenido_id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':usuario_id' => $usuario_id,
            ':contenido_id' => $contenido_id
        ]);
        return (bool)$stmt->fetchColumn();
    }

    public function ultimasResenasDeUsuario(int $usuario_id, int $limite = 5){
        $sql = "SELECT r.*, u.nombre AS nombre_usuario, c.external_id AS external_id, c.titulo AS titulo_contenido, c.poster AS poster_contenido, c.tipo AS tipo_contenido FROM resenas r JOIN usuarios u ON r.usuario_id = u.id JOIN contenidos c ON r.contenido_id = c.id WHERE r.usuario_id = :usuario_id ORDER BY r.fecha_creacion DESC LIMIT :limite";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        $resenas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $resenas ?: [];
    }

    public function ultimasResenasConContenido(int $usuario_id, int $limite = 30){
        $sql = "SELECT r.puntuacion, r.fecha_creacion, c.external_id, c.tipo AS tipo_contenido FROM resenas r JOIN contenidos c ON r.contenido_id = c.id WHERE r.usuario_id = :usuario_id ORDER BY r.fecha_creacion DESC LIMIT :limite";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        $resenas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $resenas ?: [];
    }

    public function obtenerIdsResenados(int $usuario_id): array{
        $sql = "SELECT DISTINCT c.external_id FROM resenas r JOIN contenidos c ON r.contenido_id = c.id WHERE r.usuario_id = :usuario_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':usuario_id' => $usuario_id]);
        $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
        return $ids ? array_values(array_filter($ids)) : [];
    }

    public function obtenerResenaFavorita(int $usuario_id, int $limite = 5){
        $sql = "SELECT r.*, u.nombre AS nombre_usuario, c.external_id AS external_id, c.titulo AS titulo_contenido, c.poster AS poster_contenido, c.tipo AS tipo_contenido FROM resenas r JOIN usuarios u ON r.usuario_id = u.id JOIN contenidos c ON r.contenido_id = c.id WHERE r.usuario_id = :usuario_id AND r.puntuacion = 5 ORDER BY r.fecha_creacion DESC LIMIT :limite";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        $resenas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $resenas ?: [];
    }

}