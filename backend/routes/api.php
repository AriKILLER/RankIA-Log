<?php
// Aqui van las rutas de la API del backend. Se define todo lo que se vaya a usar en frontend
require_once __DIR__ . '/../app/controllers/AutenticacionController.php';
require_once __DIR__ . '/../app/controllers/PreferenciaController.php';
require_once __DIR__ . '/../app/controllers/ContenidoController.php';
require_once __DIR__ . '/../app/middleware/Autenticacion.php';

if(session_status() === PHP_SESSION_NONE){
    session_start();
}

$autenticacion = new Autenticacion();
$autenticacionController = new AutenticacionController();
$preferenciaController = new PreferenciaController();
$contenidoController = new ContenidoController();
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
        $nombre = trim($_POST['nombre'] ?? '');
        $email = mb_strtolower(trim($_POST['email'] ?? ''));
        $password = $_POST['password'] ?? '';
        $fecha_registro = new DateTime();

        if(empty($nombre) || empty($email) || empty($password)){
            throw new Exception("Todos los campos son obligatorios para el registro de usuario");
        }

        if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
            throw new Exception("El correo electrónico proporcionado no es válido. Por favor, ingrese un correo electrónico válido.");
        }

        if(strlen($password) < 8){
            throw new Exception("La contraseña debe tener al menos 8 caracteres. Por favor, ingrese una contraseña más segura.");
        }

        $id_usuario = $autenticacionController->registroUsuario($nombre, $email, $password, $fecha_registro);
        echo json_encode(['success' => true, 'message' => 'Usuario registrado exitosamente', 'id_usuario' => $id_usuario]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if ($method === 'POST' && $action === 'inicioSesion') {
    try {
        $email = mb_strtolower(trim($_POST['email'] ?? ''));
        $password = $_POST['password'] ?? '';

        if(empty($email) || empty($password)){
            throw new Exception("Todos los campos son obligatorios para el inicio de sesion");
        }

        if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
            throw new Exception("El correo electrónico proporcionado no es válido. Por favor, ingrese un correo electrónico válido.");
        }

        $usuario = $autenticacionController->inicioSesion($email, $password);
        unset($usuario['password_hash']);

        session_regenerate_id(true);
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['usuario_email'] = $usuario['email'];
        
        echo json_encode(['success' => true, 'message' => 'Inicio de sesion exitoso', 'usuario' => $usuario]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if ($method === 'POST' && $action === 'cerrarSesion') {
    try {
        $autenticacionController->cerrarSesion();
        echo json_encode(['success' => true, 'message' => 'Sesion cerrada exitosamente']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if ($method === 'POST' && $action === 'sesionActual') {
    try {
        $autenticacion->verificarSesion();

        $usuario_id = (int)$_SESSION['usuario_id'];
        $usuario = $autenticacionController->obtenerUsuarioPorId($usuario_id);

        echo json_encode([
            'success' => true,
            'message' => 'Sesion activa',
            'usuario' => $usuario
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no autenticado'
        ]);
    }
}

if($method === 'POST' && $action === 'crearPreferenciaUsuario'){

    $preferenciaController->Transaccion();
    try{
        $autenticacion->verificarSesion();

        $usuario_id = $_SESSION['usuario_id'];
        $tipo_preferido = $_POST['tipo_preferido'];
        $duracion_preferida = $_POST['duracion_preferida'];
        $max_temporadas = $_POST['max_temporadas'];
        $preferencia_popularidad = $_POST['preferencia_popularidad'];

        $generos_ids = json_decode($_POST['generos_ids'] ?? '[]', true);

        if(!is_array($generos_ids) || empty($generos_ids)){
            throw new Exception("Debe haber al menos un genero favorito seleccionado para el usuario");
        }

        $preferencia_id = $preferenciaController->crearPreferenciaUsuario(
            $usuario_id, $tipo_preferido, $duracion_preferida, $max_temporadas,
            $preferencia_popularidad
        );
        $preferenciaController->guardarGenerosFavoritosUsuario($usuario_id, $generos_ids);

        $preferenciaController->Commit();
        echo json_encode(['success' => true, 'message' => 'Preferencias de usuario creadas exitosamente', 'preferencia_id' => $preferencia_id]);
    }catch (Exception $e){
        $preferenciaController->Rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'obtenerDetalleTmdb'){
    try{
        $tmdbId = (int)$_POST['tmdbId'];
        $tipo = $_POST['tipo'];
        $contenido = $contenidoController->obtenerDetalleTmdb($tmdbId, $tipo);
        echo json_encode(['success' => true, 'contenido' => $contenido]);        
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'obtenerCatalogoTmdb'){
    try{
        $tipo = $_POST['tipo'] ?? 'ambos';
        $pagina = (int)($_POST['pagina'] ?? 1);
        $limite = (int)($_POST['limite'] ?? 120);
        $query = trim($_POST['query'] ?? '');
        $catalogo = $contenidoController->obtenerCatalogoTmdb($tipo, $pagina, $limite, $query);
        echo json_encode(['success' => true, 'catalogo' => $catalogo]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'buscarContenidoTmdb'){
    try{
        $texto = trim($_POST['texto'] ?? '');
        $tipo = $_POST['tipo'] ?? 'ambos';
        $pagina = (int)($_POST['pagina'] ?? 1);
        $limite = (int)($_POST['limite'] ?? 100);

        if($texto === ''){
            throw new Exception("El texto de busqueda es obligatorio.");
        }

        $catalogo = $contenidoController->buscarContenidoTmdb($texto, $tipo, $pagina, $limite);
        echo json_encode(['success' => true, 'catalogo' => $catalogo]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'guardarDetalleEnBd'){
    try{
        $external_id = (int)$_POST['external_id'];
        $titulo = $_POST['titulo'];
        $tipo = $_POST['tipo'];
        $sinopsis = $_POST['sinopsis'];
        $poster = $_POST['poster'];
        $fecha_lanzamiento = $_POST['fecha_lanzamiento'] ?? null;
        $duracion = (int)($_POST['duracion'] ?? 0);
        $numero_temporadas = (int)($_POST['numero_temporadas'] ?? 0);
        $popularidad = (float)($_POST['popularidad'] ?? 0);
        $contenido_id = $contenidoController->guardarDetalleEnBd($external_id, $titulo, $tipo, $sinopsis, $poster, 
                                            $fecha_lanzamiento, $duracion, $numero_temporadas, $popularidad);
        echo json_encode(['success' => true, 'message' => 'Detalle guardado en BD exitosamente', 'contenido_id' => $contenido_id]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'obtenerDetalleDeBd'){
    try{
        $external_id = (int)($_POST['external_id'] ?? 0);
        $tipo = $_POST['tipo'] ?? '';

        if($external_id <= 0 || $tipo !== 'pelicula' && $tipo !== 'serie'){
            throw new Exception("El ID externo es requerido y el tipo debe ser pelicula o serie.");
        }

        $detalle = $contenidoController->obtenerDetalleDeBd($external_id, $tipo);

        echo json_encode(['success' => true, 'message' => 'Detalle obtenido de BD exitosamente', 'detalle' => $detalle]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

?>
