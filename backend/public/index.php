<?php
// Aqui definimos las rutas para su uso en frontend. Importamos controladores y modelos necesarios para manejar las solicitudes de la API. 
// En este caso, se definen rutas para el registro y el inicio de sesión de usuarios utilizando el AutenticacionController.
require_once __DIR__ . '/../app/controllers/AutenticacionController.php';
require_once __DIR__ . '/../app/models/Usuario.php';
require_once __DIR__ . '/../routes/api.php';
header('Content-Type: application/json');

?>