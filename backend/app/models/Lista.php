<?php
require_once __DIR__ . '/../core/Model.php';
class Lista extends Model{

    public function listaPerteneceAUsuario(int $lista_id, int $usuario_id): bool{
        $sql = "SELECT COUNT(*) FROM listas WHERE id = :lista_id AND usuario_id = :usuario_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':lista_id' => $lista_id,
            ':usuario_id' => $usuario_id
        ]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function listasPredefinidas(int $usuario_id){
        $sql = "INSERT IGNORE INTO listas (usuario_id, nombre, tipo_lista) VALUES
            (?, 'Viendo', 'predefinida'), (?, 'Completado', 'predefinida'), (?, 'Pendiente', 'predefinida')";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$usuario_id, $usuario_id, $usuario_id]);
        return $stmt->rowCount();
    }

    public function crearLista(int $usuario_id, string $nombre){
        $sql = "INSERT INTO listas (usuario_id, nombre, tipo_lista) VALUES
        (:usuario_id, :nombre, 'personalizada')";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':usuario_id' => $usuario_id,
            ':nombre' => $nombre,
        ]);
        return $this->db->lastInsertId();
    }

    public function verificarNombreLista(int $usuario_id, string $nombre){
        $sql = "SELECT COUNT(*) FROM listas WHERE usuario_id = :usuario_id AND nombre = :nombre";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':usuario_id' => $usuario_id,
            ':nombre' => $nombre
        ]);
        return $stmt->fetchColumn() > 0;
    }

    public function obtenerListasDeUsuario(int $usuario_id){
        $sql = "SELECT * FROM listas WHERE usuario_id = :usuario_id ORDER BY id ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':usuario_id' => $usuario_id]);
        $listas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $listas ?: [];
    }

    public function eliminarLista(int $id, int $usuario_id){
        $sql = "DELETE FROM listas WHERE id = :id AND usuario_id = :usuario_id AND tipo_lista = 'personalizada'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':id' => $id,
            ':usuario_id' => $usuario_id
        ]);
        return $stmt->rowCount();
    }

    public function editarLista(int $id, int $usuario_id, string $nuevo_nombre){
        $sql = "UPDATE listas SET nombre = :nuevo_nombre WHERE id = :id AND usuario_id = :usuario_id AND tipo_lista = 'personalizada'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':id' => $id,
            ':usuario_id' => $usuario_id,
            ':nuevo_nombre' => $nuevo_nombre
        ]);
        return $stmt->rowCount();
    }
}