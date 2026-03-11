<?php
// Esta clase representa a un usuario en el sistema y se encarga de interactuar con la base de datos para realizar operaciones 
// relacionadas con los usuarios, como crear un nuevo usuario o buscar un usuario por su correo electrónico. 
// Hereda de la clase Model, lo que le permite acceder a la conexión de la base de datos a través de $this->db.
require_once __DIR__ . '/../core/Model.php';
class Usuario extends Model{

    // El método crearUsuario se encarga de insertar un nuevo usuario en la base de datos.
    public function crearUsuario(String $nombre, String $email, String $password_hash, DateTime $fecha_registro){

        $sql = "INSERT INTO usuarios (nombre, email, password_hash, fecha_registro) VALUES 
        (:nombre, :email, :password_hash, :fecha_registro)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':nombre' => $nombre,
            ':email' => $email,
            ':password_hash' => $password_hash,
            ':fecha_registro' => $fecha_registro->format('Y-m-d H:i:s')
        ]);

        return $this->db->lastInsertId();
    }

    // El método buscarPorEmail se encarga de buscar un usuario en la base de datos utilizando su correo electrónico.
    public function buscarPorEmail(String $email){
        $sql = "SELECT * FROM usuarios WHERE email = :email";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        return $usuario ?: null;
    }

    // El método buscarPorId se encarga de buscar un usuario en la base de datos utilizando su ID.
    public function buscarPorId(int $id){
        $sql = "SELECT * FROM usuarios WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        return $usuario ?: null;
    }



}

?>