<?php
// Esta clase representa a un usuario en el sistema y se encarga de interactuar con la base de datos para realizar operaciones 
// relacionadas con los usuarios, como crear un nuevo usuario o buscar un usuario por su correo electrónico. 
// Hereda de la clase Model, lo que le permite acceder a la conexión de la base de datos a través de $this->db.
require_once __DIR__ . '/../core/Model.php';
class Usuario extends Model{

    // El método crearUsuario se encarga de insertar un nuevo usuario en la base de datos.
    public function crearUsuario(String $nombre, String $email, String $password_hash, DateTime $fecha_registro){

        $sql = "INSERT INTO usuarios (nombre, email, password_hash, fecha_registro, email_verificado) VALUES 
        (:nombre, :email, :password_hash, :fecha_registro, :email_verificado)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':nombre' => $nombre,
            ':email' => $email,
            ':password_hash' => $password_hash,
            ':fecha_registro' => $fecha_registro->format('Y-m-d H:i:s'),
            ':email_verificado' => false
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

    public function verificarEmail(int $usuario_id): bool{
        $sql = "UPDATE usuarios SET email_verificado = TRUE WHERE id = :usuario_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':usuario_id' => $usuario_id]);
        return $stmt->rowCount() > 0; // Devuelve true si se actualizó el usuario, lo que indica que se verificó el correo, de lo contrario false
    }

    public function actualizarNombre(int $usuario_id, string $nuevo_nombre){
        $sql = "UPDATE usuarios SET nombre = :nuevo_nombre WHERE id = :usuario_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':nuevo_nombre' => $nuevo_nombre,
            ':usuario_id' => $usuario_id
        ]);
        return $stmt->rowCount() > 0;
    }

    public function actualizarContra(int $usuario_id, string $nueva_contra_hash){
        $sql = "UPDATE usuarios SET password_hash = :nueva_contra_hash WHERE id = :usuario_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':nueva_contra_hash' => $nueva_contra_hash,
            ':usuario_id' => $usuario_id
        ]);
        return $stmt->rowCount() > 0;
    }

    public function actualizarEmail(int $usuario_id, string $nuevo_email){
        $sql = "UPDATE usuarios SET email = :nuevo_email, email_verificado = FALSE WHERE id = :usuario_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':nuevo_email' => $nuevo_email,
            ':usuario_id' => $usuario_id
        ]);
        return $stmt->rowCount() > 0;
    }

}