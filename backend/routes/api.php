<?php
// Aqui van las rutas de la API del backend. Se define todo lo que se vaya a usar en frontend
require_once __DIR__ . '/../app/controllers/AutenticacionController.php';
require_once __DIR__ . '/../app/controllers/PreferenciaController.php';
require_once __DIR__ . '/../app/controllers/ContenidoController.php';
require_once __DIR__ . '/../app/middleware/Autenticacion.php';
require_once __DIR__ . '/../app/controllers/ResenaController.php';
require_once __DIR__ . '/../app/models/Usuario.php';
require_once __DIR__ . '/../app/controllers/ListaController.php';
require_once __DIR__ . '/../app/controllers/RecomendacionController.php';

if(session_status() === PHP_SESSION_NONE){
    session_start();
}

$autenticacion = new Autenticacion();
$autenticacionController = new AutenticacionController();
$preferenciaController = new PreferenciaController();
$contenidoController = new ContenidoController();
$resenaController = new ResenaController();
$usuarioModel = new Usuario();
$listaController = new ListaController();
$recomendacionController = new RecomendacionController();
header('Content-Type: application/json; charset=UTF-8');

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
        $limite = (int)($_POST['limite'] ?? 60);
        $query = trim($_POST['query'] ?? '');
        $completarDetalles = false;
        $catalogo = $contenidoController->obtenerCatalogoTmdb($tipo, $pagina, $limite, $query, $completarDetalles);
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
        $completarDetalles = false;

        if($texto === ''){
            throw new Exception("El texto de busqueda es obligatorio.");
        }

        $catalogo = $contenidoController->buscarContenidoTmdb($texto, $tipo, $pagina, $limite, $completarDetalles);
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

if($method === 'POST' && $action === 'crearResena'){
    try{
        $autenticacion->verificarSesion();

        $usuario_id = $_SESSION['usuario_id'];
        $contenido_id = (int)($_POST['contenido_id'] ?? 0);
        $puntuacion = (int)($_POST['puntuacion'] ?? 0);
        $comentario = trim($_POST['comentario'] ?? '');
        $fecha_creacion = new DateTime();
        if($contenido_id <= 0){
            $external_id = (int)($_POST['external_id'] ?? 0);
            $tipo = $_POST['tipo'] ?? '';

        if($external_id <= 0 || ($tipo !== 'pelicula' && $tipo !== 'serie')){
            throw new Exception("Debes enviar contenido_id o external_id + tipo.");
        }

        $detalle = $contenidoController->obtenerDetalleDeBd($external_id, $tipo);
        $contenido_id = (int)($detalle['id'] ?? 0);

        if($contenido_id <= 0){
            throw new Exception("No se pudo resolver el contenido en BD.");
        }
        }
        if(empty($contenido_id) || empty($puntuacion)){
            throw new Exception("La puntuacion y el contenido son obligatorios para crear una reseña");
        }
        if($puntuacion < 1 || $puntuacion > 5){                                                                                                                          
            throw new Exception("La puntuación debe estar entre 1 y 5");
        }
        $resenaController->crearResena($usuario_id, $contenido_id, $puntuacion, $comentario, $fecha_creacion);
        echo json_encode(['success' => true, 'message' => 'Reseña creada exitosamente']);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'obtenerTodasResenasDeUsuario'){
    try{
        $autenticacion->verificarSesion();

        $usuario_id = (int)$_SESSION['usuario_id'];
        if(empty($usuario_id)){
            throw new Exception("No se ha seleccionado usuario para obtener sus reseñas");
        }
        $resenas = $resenaController->obtenerTodasResenasDeUsuario($usuario_id);
        echo json_encode(['success' => true, 'resenas' => $resenas]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}


if($method === 'POST' && $action === 'obtenerResenasPorPuntuacion'){
    try{
        $autenticacion->verificarSesion();
        
        $puntuacion = (int)$_POST['puntuacion'];
        $usuario_id = (int)$_SESSION['usuario_id'];
        if(empty($usuario_id)){
            throw new Exception("No se ha seleccionado usuario para obtener sus reseñas");
        }
        if($puntuacion < 1 || $puntuacion > 5){                                                                                                                          
            throw new Exception("La puntuación debe estar entre 1 y 5");
        }
        $resenas = $resenaController->obtenerResenasPorPuntuacion($usuario_id, $puntuacion);
        echo json_encode(['success' => true, 'resenas' => $resenas]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'editarResena'){
    try{
        $autenticacion->verificarSesion();

        $id = (int)$_POST['id'];
        $contenido_id = (int)$_POST['contenido_id'];
        $puntuacion = (int)$_POST['puntuacion'];
        $comentario = trim($_POST['comentario'] ?? '');
        $usuario_id = (int)$_SESSION['usuario_id'];
        if(empty($contenido_id) || empty($puntuacion)){
            throw new Exception("La puntuacion y el contenido son obligatorios para editar una reseña");
        }
        if($puntuacion < 1 || $puntuacion > 5){                                                                                                                          
            throw new Exception("La puntuación debe estar entre 1 y 5");
        }
        $resenaActualizada = $resenaController->editarResena($id, $usuario_id, $contenido_id, $puntuacion, $comentario);
        echo json_encode(['success' => true, 'message' => 'Reseña editada exitosamente', 'resena' => $resenaActualizada]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'eliminarResena'){
    try{
        $autenticacion->verificarSesion();

        $id = (int)$_POST['id'];
        $usuario_id = (int)$_SESSION['usuario_id'];
        if(empty($id)){
            throw new Exception("No se ha seleccionado una reseña para eliminar");
        }
        $eliminada = $resenaController->eliminarResena($id, $usuario_id);
        if(!$eliminada){
            throw new Exception("No se pudo eliminar la reseña. Asegúrate de que la reseña exista y te pertenezca.");
        }
        echo json_encode(['success' => true, 'message' => 'Reseña eliminada exitosamente']);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'ultimasResenasDeUsuario'){
    try{
        $autenticacion->verificarSesion();

        $usuario_id = (int)$_SESSION['usuario_id'];
        $limite = (int)($_POST['limite'] ?? 5);
        if(empty($usuario_id)){
            throw new Exception("No se ha seleccionado usuario para obtener sus reseñas");
        }
        if($limite < 1 || $limite > 20){
            throw new Exception("El limite de reseñas a obtener debe estar entre 1 y 20");
        }
        $resenas = $resenaController->ultimasResenasDeUsuario($usuario_id, $limite);
        echo json_encode(['success' => true, 'resenas' => $resenas]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'obtenerResenaFavorita'){
    try{
        $autenticacion->verificarSesion();

        $usuario_id = (int)$_SESSION['usuario_id'];
        $limite = (int)($_POST['limite'] ?? 5);
        if(empty($usuario_id)){
            throw new Exception("No se ha seleccionado usuario para obtener su reseña favorita");
        }
        if($limite < 1 || $limite > 20){
            throw new Exception("El limite de reseñas a obtener debe estar entre 1 y 20");
        }
        $resenaFavorita = $resenaController->obtenerResenaFavorita($usuario_id, $limite);
        $ultimasResenas = $resenaController->ultimasResenasDeUsuario($usuario_id, $limite);
        echo json_encode(['success' => true, 'resena_favorita' => $resenaFavorita, 'ultimas_resenas' => $ultimasResenas]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'verificarCorreo'){
    try{
        $token = trim($_POST['token'] ?? '');
        if($token === ''){
            throw new Exception("Token no proporcionado para verificación de correo.");
        }

        $autenticacionController->verificarCorreo($token);

        echo json_encode(['success' => true,'message' => 'Correo verificado exitosamente']);
    }catch (Exception $e){
        echo json_encode(['success' => false,'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'crearLista'){
    try{
        $autenticacion->verificarSesion();

        $usuario_id = (int)$_SESSION['usuario_id'];
        $nombre = trim($_POST['nombre'] ?? '');
        $tipo_lista = $_POST['tipo_lista'] ?? 'personalizada';
        if(empty($nombre)){
            throw new Exception("El nombre de la lista no puede estar vacío");
        }
        if($nombre === 'Viendo' || $nombre === 'Completado' || $nombre === 'Pendiente'){
            throw new Exception("No se pueden crear listas con nombres reservados. Por favor, elija otro nombre.");
        }
        $lista_id = $listaController->crearLista($usuario_id, $nombre, $tipo_lista);
        echo json_encode(['success' => true, 'message' => 'Lista creada exitosamente', 'lista_id' => $lista_id]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'obtenerListasDeUsuario'){
    try{
        $autenticacion->verificarSesion();

        $usuario_id = (int)$_SESSION['usuario_id'];
        if(empty($usuario_id)){
            throw new Exception("No se ha seleccionado usuario para obtener sus listas");
        }
        $listas = $listaController->obtenerListasDeUsuario($usuario_id);
        echo json_encode(['success' => true, 'listas' => $listas]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'eliminarLista'){
    try{
        $autenticacion->verificarSesion();

        $id = (int)$_POST['id'];
        $usuario_id = (int)$_SESSION['usuario_id'];
        if(empty($id)){
            throw new Exception("No se ha seleccionado una lista para eliminar");
        }
        $eliminada = $listaController->eliminarLista($id, $usuario_id);
        if(!$eliminada){
            throw new Exception("No se pudo eliminar la lista. Asegúrate de que la lista exista, te pertenezca y no sea una lista predefinida.");
        }
        echo json_encode(['success' => true, 'message' => 'Lista eliminada exitosamente']);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'editarLista'){
    try{
        $autenticacion->verificarSesion();

        $id = (int)$_POST['id'];
        $nuevo_nombre = trim($_POST['nuevo_nombre'] ?? '');
        $usuario_id = (int)$_SESSION['usuario_id'];
        if(empty($id)){
            throw new Exception("No se ha seleccionado una lista para editar");
        }
        if(empty($nuevo_nombre)){
            throw new Exception("Añada un nuevo para la lista. El nombre no puede estar vacío");            
        }
        if($nuevo_nombre === 'Viendo' || $nuevo_nombre === 'Completado' || $nuevo_nombre === 'Pendiente'){
            throw new Exception("No se pueden usar nombres reservados para las listas. Por favor, elija otro nombre.");
        }
        $editada = $listaController->editarLista($id, $usuario_id, $nuevo_nombre);
        if(!$editada){
            throw new Exception("No se pudo editar la lista. Asegúrate de que la lista exista, te pertenezca y no sea una lista predefinida.");
        }
        echo json_encode(['success' => true, 'message' => 'Lista editada exitosamente']);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'agregarContenidoALista'){
    try{
        $autenticacion->verificarSesion();

        $usuario_id = (int)$_SESSION['usuario_id'];
        $lista_id = (int)$_POST['lista_id'];
        $contenido_id = (int)($_POST['contenido_id'] ?? 0);
        $external_id = (int)($_POST['external_id'] ?? 0);
        $tipoRaw = trim($_POST['tipo'] ?? '');
        $tipo = match($tipoRaw){
            'movie' => 'pelicula',
            'tv' => 'serie',
            default => $tipoRaw
        };

        if($lista_id <= 0){
            throw new Exception("No se ha seleccionado una lista válida.");
        }

        if(!$listaController->listaPerteneceAUsuario($lista_id, $usuario_id)){
            throw new Exception("La lista no existe o no te pertenece.");
        }

        // Prioridad 1: si viene external_id + tipo válido, resolver siempre por BD/TMDB.
        if($external_id > 0 && ($tipo === 'pelicula' || $tipo === 'serie')){
            $detalle = $contenidoController->obtenerDetalleDeBd($external_id, $tipo);
            $contenido_id = (int)($detalle['id'] ?? 0);

            if($contenido_id <= 0){
                throw new Exception("No se pudo resolver el contenido en BD para agregarlo a la lista.");
            }
        } else {
            // Prioridad 2: usar contenido_id interno solo si existe en BD.
            if($contenido_id > 0 && $contenidoController->existeContenidoPorId($contenido_id)){
                // Nada más que hacer.
            } else {
                // Si el cliente manda contenido_id de TMDB en lugar del id interno, intentamos resolverlo.
                if($contenido_id > 0 && ($tipo === 'pelicula' || $tipo === 'serie')){
                    $detalle = $contenidoController->obtenerDetalleDeBd($contenido_id, $tipo);
                    $contenido_id = (int)($detalle['id'] ?? 0);
                }

                if($contenido_id <= 0 || !$contenidoController->existeContenidoPorId($contenido_id)){
                    throw new Exception("Debes enviar contenido_id interno válido o external_id + tipo para resolver el contenido.");
                }
            }
        }

        $agregado = $listaController->agregarContenidoALista($lista_id, $contenido_id);
        if(!$agregado){
            throw new Exception("No se pudo agregar el contenido a la lista. Asegúrate de que la lista exista, te pertenezca y el contenido no esté ya en la lista.");
        }
        echo json_encode(['success' => true, 'message' => 'Contenido agregado a la lista exitosamente']);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'eliminarContenidoDeLista'){
    try{
        $autenticacion->verificarSesion();

        $usuario_id = (int)$_SESSION['usuario_id'];
        $lista_id = (int)$_POST['lista_id'];
        $contenido_id = (int)$_POST['contenido_id'];
        if($lista_id <= 0){
            throw new Exception("No se ha seleccionado una lista válida.");
        }
        if(!$listaController->listaPerteneceAUsuario($lista_id, $usuario_id)){
            throw new Exception("La lista no existe o no te pertenece.");
        }
        if(empty($contenido_id)){
            throw new Exception("No has seleccionado ningún contenido. Por favor, seleccione un contenido para eliminar de la lista.");
        }
        $eliminado = $listaController->eliminarContenidoDeLista($lista_id, $contenido_id);
        if(!$eliminado){
            throw new Exception("No se pudo eliminar el contenido de la lista. Asegúrate de que la lista exista, te pertenezca y el contenido esté en la lista.");
        }
        echo json_encode(['success' => true, 'message' => 'Contenido eliminado de la lista exitosamente']);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'obtenerContenidosDeLista'){
    try{
        $autenticacion->verificarSesion();

        $lista_id = (int)$_POST['lista_id'];
        if(empty($lista_id)){
            throw new Exception("No se ha seleccionado una lista para obtener su contenido");
        }
        $contenidos = $listaController->obtenerContenidosDeLista($lista_id);
        echo json_encode(['success' => true, 'contenidos' => $contenidos]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'obtenerRecomendaciones'){
    try{
        $autenticacion->verificarSesion();

        $usuario_id = (int)$_SESSION['usuario_id'];
        $tipo = $_POST['tipo'] ?? 'ambos';
        $limite = (int)($_POST['limite'] ?? 6);

        if($limite < 1 || $limite > 50){
            throw new Exception("El limite debe estar entre 1 y 50.");
        }

        $recomendaciones = $recomendacionController->obtenerRecomendaciones($usuario_id, $tipo, $limite);

        echo json_encode(['success' => true, 'recomendaciones' => $recomendaciones]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'actualizarNombre'){
    try{
        $autenticacion->verificarSesion();

        $usuario_id = (int)$_SESSION['usuario_id'];
        $nuevo_nombre = trim($_POST['nuevo_nombre'] ?? '');

        if(empty($nuevo_nombre)){
            throw new Exception("El nuevo nombre no puede estar vacío.");
        }

        $actualizado = $usuarioModel->actualizarNombre($usuario_id, $nuevo_nombre);

        if(!$actualizado){
            throw new Exception("No se pudo actualizar el nombre. Asegúrate de que el usuario exista.");
        }

        echo json_encode(['success' => true, 'message' => 'Nombre actualizado exitosamente']);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'actualizarEmail'){
    try{
        $autenticacion->verificarSesion();

        $usuario_id = (int)$_SESSION['usuario_id'];
        $nuevo_email = mb_strtolower(trim($_POST['nuevo_email'] ?? ''));
        if(empty($nuevo_email)){
            throw new Exception("El nuevo correo electrónico no puede estar vacío.");
        }
        if(!filter_var($nuevo_email, FILTER_VALIDATE_EMAIL)){
            throw new Exception("El nuevo correo electrónico proporcionado no es válido. Por favor, ingrese un correo electrónico válido.");
        }
        $existente = $usuarioModel->buscarPorEmail($nuevo_email);
        if($existente && (int)$existente['id'] !== $usuario_id){
            throw new Exception("El correo electrónico ya está registrado. Por favor, intente con otro correo electrónico para actualizar su perfil.");
        }
        $autenticacionController->actualizarEmail($usuario_id, $nuevo_email);
        echo json_encode(['success' => true, 'message' => 'Correo electrónico actualizado exitosamente']);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'solicitarRecuperacionContrasena'){
    try{
        $email = mb_strtolower(trim($_POST['email'] ?? ''));
        if($email === ''){
            throw new Exception("El correo es obligatorio.");
        }
        $autenticacionController->solicitarResetContra($email);
        echo json_encode(['success' => true, 'message' => 'Correo de recuperación enviado']);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'restablecerContrasena'){
    try{
        $token = trim($_POST['token'] ?? '');
        $password_nueva = $_POST['password_nueva'] ?? '';
        $confirmar = $_POST['confirmar'] ?? '';

        if($token === ''){
            throw new Exception("Token requerido.");
        }

        $autenticacionController->actualizarContra($token, $password_nueva, $confirmar);

        // Cerrar sesion si estaba logueado
        if(isset($_SESSION['usuario_id'])){
            $autenticacion->verificarCierreSesion();
        }

        echo json_encode(['success' => true, 'message' => 'Contraseña actualizada']);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if($method === 'POST' && $action === 'obtenerPreferenciasUsuario'){
    try{
        $autenticacion->verificarSesion();

        $usuario_id = (int)$_SESSION['usuario_id'];
        if(empty($usuario_id)){
            throw new Exception("No se ha seleccionado usuario para obtener sus preferencias");
        }
        $preferencias = $preferenciaController->obtenerPreferenciasPorUsuarioId($usuario_id);
        echo json_encode(['success' => true, 'preferencias' => $preferencias]);
    }catch (Exception $e){
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>
