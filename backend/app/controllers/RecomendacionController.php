<?php
require_once __DIR__ . '/../services/RecomandacionService.php';
require_once __DIR__ . '/../models/Preferencia.php';
require_once __DIR__ . '/../models/Genero.php';
require_once __DIR__ . '/../models/Contenido.php';
require_once __DIR__ . '/../models/Resena.php';

class RecomendacionController{
    private RecomandacionService $recomendacionService;
    private Preferencia $preferenciaModel;
    private Genero $generoModel;
    private Contenido $contenidoModel;
    private Resena $resenaModel;

    public function __construct(){
        $this->recomendacionService = new RecomandacionService();
        $this->preferenciaModel = new Preferencia();
        $this->generoModel = new Genero();
        $this->contenidoModel = new Contenido();
        $this->resenaModel = new Resena();
    }

    public function obtenerRecomendaciones(int $usuario_id, string $tipo = 'ambos', int $limite = 6): array{
        $preferenciasList = $this->preferenciaModel->obtenerPreferenciasPorUsuarioId($usuario_id);
        $preferencias = is_array($preferenciasList) && !empty($preferenciasList) ? $preferenciasList[0] : null;

        if(!$preferencias){
            throw new Exception("No se encontraron preferencias para el usuario.");
        }

        $generos = $this->generoModel->obtenerGenerosPorUsuarioId($usuario_id) ?? [];
        $generosFavoritos = array_map('intval', array_column($generos, 'id'));

        $tipoPreferido = $preferencias['tipo_preferido'] ?? 'ambos';
        $tipoFinal = $tipo === 'ambos' ? $tipoPreferido : $tipo;

        if(!in_array($tipoFinal, ['pelicula', 'serie', 'ambos'], true)){
            $tipoFinal = 'ambos';
        }

        $catalogo = $this->contenidoModel->obtenerCatalogoTmdb($tipoFinal, 1, 30, '', true);

        $perfilResenas = $this->construirPerfilResenas($usuario_id, 30);

        return $this->recomendacionService->obtenerRecomendaciones(
            $preferencias,
            $catalogo,
            $generosFavoritos,
            $limite,
            $perfilResenas
        );
    }

    // Construye un perfil basado en las ultimas reseñas del usuario, acumulando puntuaciones por tipo, genero, duracion o temporadas para hacer un promedio que luego se usa en la recomendacion de contenidos dependiendo de las preferencias y su historial de reseñas para mostrar mas o menos contenido que coincida con esos patrones de puntuacion del usuario. Si el usuario no tiene reseñas, devuelve un perfil vacío y la recomendación se basará solo en las preferencias declaradas.
    private function construirPerfilResenas(int $usuario_id, int $limite = 30): array{
        $resenas = $this->resenaModel->ultimasResenasConContenido($usuario_id, $limite);
        if(empty($resenas)){
            return [];
        }

        // el perfil es un array de claves (tipo, genero, duracion, temporadas) cada una con un subarray de claves (genero id, tipo duracion...) se suman puntuaciones para sacar un promedio que se usara en la recomendacion de contenidos, por ejemplo: $perfil['generos'][3]['avg'] = 4.5 significa que el usuario suele puntuar con 4.5 los contenidos del genero con id 3, entonces se le mostraran mas recomendaciones de ese genero si coincide con sus preferencias
        $perfil = [
            'generos' => [],
            'tipo' => [],
            'duracion' => [],
            'temporadas' => []
        ];

        foreach($resenas as $resena){
            $puntuacion = (int)($resena['puntuacion'] ?? 0);
            $tipo = $resena['tipo_contenido'] ?? '';
            $externalId = (int)($resena['external_id'] ?? 0);

            if($puntuacion <= 0 || $externalId <= 0 || !in_array($tipo, ['pelicula', 'serie'], true)){
                continue;
            }

            $detalle = $this->contenidoModel->obtenerDetalleTmdb($externalId, $tipo);

            $this->acumularPerfil($perfil['tipo'], $tipo, $puntuacion);

            if($tipo === 'pelicula'){
                $runtime = (int)($detalle['runtime'] ?? 0);
                $bucket = $this->bucketDuracion($runtime);
                if($bucket !== ''){
                    $this->acumularPerfil($perfil['duracion'], $bucket, $puntuacion);
                }
            }

            if($tipo === 'serie'){
                $temporadas = (int)($detalle['number_of_seasons'] ?? 0);
                $bucket = $this->bucketTemporadas($temporadas);
                if($bucket !== ''){
                    $this->acumularPerfil($perfil['temporadas'], $bucket, $puntuacion);
                }
            }

            $generosTmdb = array_map(
                fn($genero) => (int)($genero['id'] ?? 0),
                $detalle['genres'] ?? []
            );
            $generosLocales = $this->mapearGenerosTmdb($generosTmdb);
            foreach($generosLocales as $generoId){
                $this->acumularPerfil($perfil['generos'], (string)$generoId, $puntuacion);
            }
        }

        return $this->finalizarPerfil($perfil);
    }

    private function acumularPerfil(array &$mapa, string $clave, int $puntuacion): void{
        if(!isset($mapa[$clave])){
            $mapa[$clave] = ['sum' => 0, 'count' => 0];
        }
        $mapa[$clave]['sum'] += $puntuacion;
        $mapa[$clave]['count'] += 1;
    }

    private function finalizarPerfil(array $perfil): array{
        foreach($perfil as $tipo => $mapa){
            foreach($mapa as $clave => $datos){
                $count = (int)($datos['count'] ?? 0);
                if($count <= 0){
                    unset($perfil[$tipo][$clave]);
                    continue;
                }
                $sum = (float)($datos['sum'] ?? 0);
                $perfil[$tipo][$clave]['avg'] = $sum / $count;
            }
        }

        return $perfil;
    }

    private function bucketDuracion(int $runtime): string{
        if($runtime <= 0){
            return '';
        }
        if($runtime <= 100){
            return 'corta';
        }
        if($runtime <= 140){
            return 'media';
        }
        return 'larga';
    }

    private function bucketTemporadas(int $temporadas): string{
        if($temporadas <= 0){
            return '';
        }
        if($temporadas === 1){
            return '1';
        }
        if($temporadas >= 2 && $temporadas <= 3){
            return '2-3';
        }
        return '4+';
    }

    private function mapearGenerosTmdb(array $generosTmdb): array{
        $mapGeneros = [
            28 => 1,
            10759 => 1,
            18 => 2,
            35 => 3,
            27 => 4,
            53 => 5,
            9648 => 5,
            878 => 6,
            10765 => 6 & 7,
            14 => 7,
            10749 => 8,
            16 => 9,
            99 => 10,
        ];

        $locales = [];
        foreach($generosTmdb as $idTmdb){
            if(!isset($mapGeneros[$idTmdb])){
                continue;
            }
            $locales[] = (int)$mapGeneros[$idTmdb];
        }

        $locales = array_values(array_unique(array_filter($locales)));
        return $locales;
    }
}