<?php
require_once __DIR__ . '/../services/TmdbService.php';
require_once __DIR__ . '/../core/Model.php';
class Contenido extends Model{

    private $tmdbService;

    public function __construct(){
        parent::__construct();
        $this->tmdbService = new TmdbService();
    }


    public function obtenerDetalleTmdb(int $tmdbId, string $tipo): array{
        if($tipo === 'pelicula'){
            return $this->tmdbService->detallePelicula($tmdbId);
        }else if($tipo === 'serie'){
            return $this->tmdbService->detalleSerie($tmdbId);
        }else{
            throw new Exception("Tipo de contenido no válido. Debe ser 'pelicula' o 'serie'.");
        }
    }

    public function buscarContenidoTmdb(string $texto, int $pagina = 1): array{
        return $this->tmdbService->buscarMulti($texto, $pagina);
    }

    public function guardarDetalleEnBd(int $external_id, string $titulo, string $tipo, string $sinopsis, string $poster, 
                                            string $fecha_lanzamiento, int $duracion, int $numero_temporadas, float $popularidad){
        
        if(empty($external_id) || empty($titulo) || empty($tipo)){
            throw new Exception("Los campos external_id, titulo y tipo son obligatorios para guardar el contenido en la base de datos.");
        }

        if($tipo !== 'pelicula' && $tipo !== 'serie'){
            throw new Exception("El tipo de contenido debe ser 'pelicula' o 'serie'.");
        }

        if($duracion < 0 || $numero_temporadas < 0 || $popularidad < 0){
            throw new Exception("Los campos duracion, numero_temporadas y popularidad no pueden ser negativos.");
        }

        if($external_id <= 0){
            throw new Exception("El campo external_id debe ser un número entero positivo.");
        }
        
        $sql = "INSERT INTO contenidos
        (external_id, titulo, tipo, sinopsis, poster, fecha_lanzamiento, duracion, numero_temporadas, popularidad)
        VALUES
        (:external_id, :titulo, :tipo, :sinopsis, :poster, :fecha_lanzamiento, :duracion, :numero_temporadas, :popularidad)
        ON DUPLICATE KEY UPDATE
            titulo = VALUES(titulo),
            sinopsis = VALUES(sinopsis),
            poster = VALUES(poster),
            fecha_lanzamiento = VALUES(fecha_lanzamiento),
            duracion = VALUES(duracion),
            numero_temporadas = VALUES(numero_temporadas),
            popularidad = VALUES(popularidad)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':external_id' => $external_id,
            ':titulo' => $titulo,
            ':tipo' => $tipo,
            ':sinopsis' => $sinopsis,
            ':poster' => $poster,
            ':fecha_lanzamiento' => $fecha_lanzamiento ?: null,
            ':duracion' => $duracion ?: null,
            ':numero_temporadas' => $numero_temporadas ?: null,
            ':popularidad' => $popularidad ?: null,
        ]);

        $respuesta = $this->db->prepare("SELECT id FROM contenidos WHERE external_id = :external_id AND tipo = :tipo");
        $respuesta->execute([
            ':external_id' => $external_id,
            ':tipo' => $tipo
        ]);
        $id = (int)$respuesta->fetchColumn();
        if($id <= 0){
            throw new Exception("Error al guardar el contenido en la base de datos.");
        }
        return $id;
    }

    public function obtenerDetalleDeBd(int $external_id, string $tipo){
        $sql = "SELECT * FROM contenidos WHERE external_id = :external_id AND tipo = :tipo";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':external_id' => $external_id,
            ':tipo' => $tipo
        ]);

        $contenido = $stmt->fetch(PDO::FETCH_ASSOC);
       if($contenido){
            return $contenido;
       }

       $tmdb = $this->obtenerDetalleTmdb($external_id, $tipo);
         if($tmdb && $tipo === 'pelicula'){
                $this->guardarDetalleEnBd(
                 $external_id,
                 $tmdb['title'],
                 $tipo,
                 $tmdb['overview'],
                 $tmdb['poster_path'],
                 $tmdb['release_date'],
                 $tmdb['runtime'],
                 0,
                 $tmdb['vote_average']
                );
            }else if($tmdb && $tipo === 'serie'){
                $this->guardarDetalleEnBd(
                 $external_id,
                 $tmdb['name'],
                 $tipo,
                 $tmdb['overview'],
                 $tmdb['poster_path'],
                 $tmdb['first_air_date'],
                 0,
                 $tmdb['number_of_seasons'],
                 $tmdb['vote_average']
                );
            }
        return $tmdb;
    }

    public function obtenerCatalogoTmdb(string $tipo = 'ambos', int $pagina = 1): array{
        return $this->tmdbService->obtenerCatalogoTmdb($tipo, $pagina);
    }
    
}