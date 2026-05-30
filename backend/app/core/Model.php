<?php
// La clase Model es una clase base que proporciona una conexión a la base de datos para las clases que heredan de ella.
// En el constructor de la clase Model, se crea una nueva instancia de la clase Database y se llama al método conexion() para establecer 
// la conexión a la base de datos. 
// La conexión se almacena en la propiedad $db, que puede ser utilizada por las clases hijas para realizar operaciones en la base de datos.
require_once __DIR__ . '/Database.php';
class Model{
    protected $db;

    public function __construct(){
        $this->db = (new Database())->conexion();
    }
}