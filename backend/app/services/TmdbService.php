<?php
class TmdbService{
    private string $url;
    private string $token_acceso;
    private string $idioma;

    public function __construct() {
        $config = require __DIR__ . ('/../../config/app.php');
        $tmdb = $config['tmdb'];

        $this->url = $tmdb['url'] . '/';
        $this->token_acceso = $tmdb['token_acceso'];
        $this->idioma = $tmdb['idioma'];
    }

    public function obtenerDatos($url){
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->token_acceso,
                'Accept: application/json'
            ],
        ]);
        $respuesta = curl_exec($ch);
        $error = curl_error($ch);
        $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if($respuesta === false){
            throw new Exception('Error en la solicitud a TMDb: ' . $error);
        }

        $datos = json_decode($respuesta, true);
        if(!is_array($datos)){
            throw new Exception('Respuesta de TMDb no es un array válido');
        }

        if($http >= 400){
            $mensajeError = $datos['status_message'] ?? 'Error desconocido';
            throw new Exception('Error en la respuesta de TMDb: ' . $mensajeError);
        }

        return $datos;
    }

    public function detallePelicula(int $tmdbId): array{
        return $this->obtenerDatos($this->url . "movie/{$tmdbId}?language={$this->idioma}");
    }

    public function detalleSerie(int $tmdbId): array{
        return $this->obtenerDatos($this->url . "tv/{$tmdbId}?language={$this->idioma}");
    }

    public function buscarMulti(string $texto, int $pagina = 1): array{
        return $this->obtenerDatos($this->url . "search/multi?query=" . urlencode($texto) . "&page={$pagina}&language={$this->idioma}");
    }

    private function normalizar(array $item, string $tipo): array{
        return [
            'tmdb_id' => (int)($item['id'] ?? 0),
            'tipo' => $tipo,
            'titulo' => $tipo === 'pelicula'
                ? ($item['title'] ?? '')
                : ($item['name'] ?? ''),
            'fecha' => $tipo === 'pelicula'
                ? ($item['release_date'] ?? null)
                : ($item['first_air_date'] ?? null),
            'poster_path' => $item['poster_path'] ?? null,
            'overview' => $item['overview'] ?? '',
            'popularity' => (float)($item['popularity'] ?? 0),
            'vote_average' => (float)($item['vote_average'] ?? 0),
            'genre_ids' => $item['genre_ids'] ?? [],
            'duracion' => $tipo === 'pelicula'
                ? (int)($item['runtime'] ?? 0)
                : (int)(($item['episode_run_time'][0] ?? 0)),
            'numero_temporadas' => $tipo === 'serie'
                ? (int)($item['number_of_seasons'] ?? 0)
                : 0,
        ];
    }

    private function completarDetalles(array $catalogo): array{
        foreach ($catalogo as &$item) {
            $tmdbId = (int)($item['tmdb_id'] ?? 0);
            if ($tmdbId <= 0) {
                continue;
            }

            if (($item['tipo'] ?? '') === 'pelicula' && empty($item['duracion'])) {
                $detalle = $this->detallePelicula($tmdbId);
                $item['duracion'] = (int)($detalle['runtime'] ?? 0);
            }

            if (($item['tipo'] ?? '') === 'serie' && empty($item['numero_temporadas'])) {
                $detalle = $this->detalleSerie($tmdbId);
                $item['numero_temporadas'] = (int)($detalle['number_of_seasons'] ?? 0);
                if (empty($item['duracion'])) {
                    $item['duracion'] = (int)($detalle['episode_run_time'][0] ?? 0);
                }
            }
        }

        return $catalogo;
    }

    public function buscarContenidoTmdb(string $texto, string $tipo = 'ambos', int $pagina = 1, int $limite = 100): array{
        $texto = trim($texto);
        if ($texto === '') {
            return [];
        }

        $pagina = max(1, $pagina);
        $limite = max(1, min($limite, 200));
        $paginasNecesarias = (int)ceil($limite / 20);

        $catalogo = [];
        for ($i = 0; $i < $paginasNecesarias; $i++) {
            $paginaActual = $pagina + $i;
            $resultados = $this->buscarMulti($texto, $paginaActual);
            $items = $resultados['results'] ?? [];
            if (empty($items)) {
                break;
            }

            foreach ($items as $item) {
                $mediaType = $item['media_type'] ?? '';
                $tipoItem = '';
                if ($mediaType === 'movie') {
                    $tipoItem = 'pelicula';
                } elseif ($mediaType === 'tv') {
                    $tipoItem = 'serie';
                } else {
                    continue;
                }

                if ($tipo !== 'ambos' && $tipoItem !== $tipo) {
                    continue;
                }

                $catalogo[] = $this->normalizar($item, $tipoItem);
            }
        }

        usort($catalogo, fn($a, $b) => $b['popularity'] <=> $a['popularity']);
        $catalogo = array_slice($catalogo, 0, $limite);
        return $this->completarDetalles($catalogo);
    }

    public function obtenerCatalogoTmdb(string $tipo = 'ambos', int $pagina = 1, int $limite = 120, string $query = ''): array{
        $query = trim($query);
        if ($query !== '') {
            return $this->buscarContenidoTmdb($query, $tipo, $pagina, $limite);
        }

        $pagina = max(1, $pagina);
        $limite = max(1, min($limite, 200));
        $itemsPorPagina = $tipo === 'ambos' ? 40 : 20;
        $paginasNecesarias = (int)ceil($limite / $itemsPorPagina);

        $catalogo = [];
        for ($i = 0; $i < $paginasNecesarias; $i++) {
            $paginaActual = $pagina + $i;

            if($tipo === 'pelicula' || $tipo === 'ambos'){
                $peliculas = $this->obtenerDatos($this->url . "movie/popular?page={$paginaActual}&language={$this->idioma}");
                foreach($peliculas['results'] ?? [] as $pelicula){
                    $catalogo[] = $this->normalizar($pelicula, 'pelicula');
                }
            }

            if($tipo === 'serie' || $tipo === 'ambos'){
                $series = $this->obtenerDatos($this->url . "tv/popular?page={$paginaActual}&language={$this->idioma}");
                foreach($series['results'] ?? [] as $serie){
                    $catalogo[] = $this->normalizar($serie, 'serie');
                }
            }
        }
        
        usort($catalogo, fn($a, $b) => $b['popularity'] <=> $a['popularity']);
        $catalogo = array_slice($catalogo, 0, $limite);
        return $this->completarDetalles($catalogo);
    }
}
?>

