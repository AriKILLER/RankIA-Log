<?php
// Aqui van las rutas de la API del backend. Se define todo lo que se vaya a usar en frontend
require_once __DIR__ . '/../app/controllers/AutenticacionController.php';
$autenticacionController = new AutenticacionController();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_POST['action'] ?? null;

if ($method !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Metodo no permitido. Usa POST']);
    return;
}

// Ruta para el registro de usuarios
if ($method === 'POST' && $action === 'registroUsuario') {
    try {
        $nombre = $_POST['nombre'];
        $email = $_POST['email'];
        $password = $_POST['password'];
        $fecha_registro = new DateTime();
        $id_usuario = $autenticacionController->registroUsuario($nombre, $email, $password, $fecha_registro);
        echo json_encode(['success' => true, 'message' => 'Usuario registrado exitosamente', 'id_usuario' => $id_usuario]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if ($method === 'POST' && $action === 'inicioSesion') {
    try {
        $email = $_POST['email'];
        $password = $_POST['password'];
        $usuario = $autenticacionController->inicioSesion($email, $password);
        unset($usuario['password_hash']);
        echo json_encode(['success' => true, 'message' => 'Inicio de sesion exitoso', 'usuario' => $usuario]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

?>
