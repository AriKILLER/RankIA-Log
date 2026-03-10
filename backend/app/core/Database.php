<?php
// La clase Database es responsable de manejar la conexión a la base de datos con toda su configuracion asociada
class Database{
    private $host;
    private $user;
    private $password;
    private $dbname;
    private $conn;

    public function __construct($config = null){
        if ($config === null) {
            $config = require __DIR__ . '/../../config/database.php';
        }

        $this->host = $config['host'];
        $this->user = $config['user'];
        $this->password = $config['password'];
        $this->dbname = $config['dbname'];
    }

    public function conexion(){
        try{
            $this->conn = new PDO("mysql:host=$this->host;dbname=$this->dbname", $this->user, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $this->conn;
        } catch(PDOException $e) {
            echo "Ha ocurrido un error: " . $e->getMessage();
        }
    }
}