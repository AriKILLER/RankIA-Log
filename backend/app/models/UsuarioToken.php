<?php
require_once __DIR__ . '/../core/Model.php';
class UsuarioToken extends Model{

    public function crearToken(int $usuario_id, DateTime $fecha_expiracion): string{
        $token = bin2hex(random_bytes(32));// Genera un token de 64 caracteres random
        $tokenHash = hash('sha256', $token); // Hashea el token para almacenarlo de forma segura en la base de datos
        $sql = "INSERT INTO tokens_verificacion (usuario_id, token, fecha_expiracion) VALUES (:usuario_id, :token, :fecha_expiracion)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':usuario_id' => $usuario_id,
            ':token' => $tokenHash,
            ':fecha_expiracion' => $fecha_expiracion->format('Y-m-d H:i:s')
        ]);
        return $token; // Devuelve el token sin hashear para que el cliente lo use en las solicitudes y se guarda el hasheado para seguridad en la base de datos
    }

    public function validarToken(string $token): bool{
        $tokenHash = hash('sha256', $token); // hashea el token que recibe para compararlo con el de bd
        $sql = "SELECT * FROM tokens_verificacion WHERE token = :tokenHash AND fecha_expiracion > NOW() AND utilizado = FALSE";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tokenHash' => $tokenHash]);
        $comprobacionToken = $stmt->fetch(PDO::FETCH_ASSOC);
        return $comprobacionToken !== false; // Si encuentra un token válido, devuelve true, de lo contrario false
    }

    public function tokenUtilizado(string $token): bool{
        $tokenHash = hash('sha256', $token); // hashea el token que recibe para compararlo con el de bd
        $sql = "UPDATE tokens_verificacion SET utilizado = TRUE WHERE token = :tokenHash AND fecha_expiracion > NOW() AND utilizado = FALSE";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tokenHash' => $tokenHash]);
        return $stmt->rowCount() > 0; // Devuelve true si se actualizó el token, lo que indica que se marcó como utilizado, de lo contrario false
    }

    public function obtenerUsuarioIdPorToken(string $token): ?int{
        $tokenHash = hash('sha256', $token);
        $sql = "SELECT usuario_id
            FROM tokens_verificacion
            WHERE token = :tokenHash
              AND fecha_expiracion > NOW()
              AND utilizado = FALSE
            LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':tokenHash' => $tokenHash]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? (int)$row['usuario_id'] : null;
    }

}