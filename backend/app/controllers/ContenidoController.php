<?php
require_once __DIR__ . '/../services/TmdbService.php';
require_once __DIR__ . '/../models/Contenido.php';
class ContenidoController{
    private $contenidoModel;

    public function __construct(){
        $this->contenidoModel = new Contenido();
    }

    public function obtenerDetalleTmdb(int $tmdbId, string $tipo): array{
        return $this->contenidoModel->obtenerDetalleTmdb($tmdbId, $tipo);
    }

    public function buscarContenidoTmdb(string $texto, string $tipo = 'ambos', int $pagina = 1, int $limite = 100): array{
        return $this->contenidoModel->buscarContenidoTmdb($texto, $tipo, $pagina, $limite);
    }

    public function guardarDetalleEnBd(int $external_id, string $titulo, string $tipo, string $sinopsis, string $poster, 
                                            string $fecha_lanzamiento, int $duracion, int $numero_temporadas, float $popularidad){
        return $this->contenidoModel->guardarDetalleEnBd($external_id, $titulo, $tipo, $sinopsis, $poster, 
                                            $fecha_lanzamiento, $duracion, $numero_temporadas, $popularidad);
    }

    public function obtenerDetalleDeBd(int $external_id, string $tipo): array{
        return $this->contenidoModel->obtenerDetalleDeBd($external_id, $tipo);
    }

    public function obtenerCatalogoTmdb(string $tipo = 'ambos', int $pagina = 1, int $limite = 120, string $query = ''): array{
        return $this->contenidoModel->obtenerCatalogoTmdb($tipo, $pagina, $limite, $query);
    }

    public function existeContenidoPorId(int $contenido_id): bool{
        return $this->contenidoModel->existeContenidoPorId($contenido_id);
    }
}
