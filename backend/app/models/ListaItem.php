<?php
require_once __DIR__ . '/../core/Model.php';
class ListaItem extends Model{

    public function agregarContenidoALista(int $lista_id, int $contenido_id){
        $sqlContenido = "SELECT COUNT(*) FROM contenidos WHERE id = :contenido_id";
        $stmtContenido = $this->db->prepare($sqlContenido);
        $stmtContenido->execute([':contenido_id' => $contenido_id]);

        if((int)$stmtContenido->fetchColumn() === 0){
            throw new Exception("El contenido seleccionado no existe en la base de datos.");
        }

        $sql = "INSERT INTO lista_items (lista_id, contenido_id) VALUES (:lista_id, :contenido_id)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':lista_id' => $lista_id,
            ':contenido_id' => $contenido_id
        ]);
        return $this->db->lastInsertId();
    }

    public function eliminarContenidoDeLista(int $lista_id, int $contenido_id){
        $sql = "DELETE FROM lista_items WHERE lista_id = :lista_id AND contenido_id = :contenido_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':lista_id' => $lista_id,
            ':contenido_id' => $contenido_id
        ]);
        return $stmt->rowCount();
    }

    public function obtenerContenidosDeLista(int $lista_id){
        $sql = "SELECT c.* FROM lista_items li JOIN contenidos c ON li.contenido_id = c.id WHERE li.lista_id = :lista_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':lista_id' => $lista_id]);
        $contenidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $contenidos ?: [];
    }

    public function verificarContenidoEnLista(int $lista_id, int $contenido_id){
        $sql = "SELECT COUNT(*) FROM lista_items WHERE lista_id = :lista_id AND contenido_id = :contenido_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':lista_id' => $lista_id,
            ':contenido_id' => $contenido_id
        ]);
        return $stmt->fetchColumn() > 0;
    }
}