<?php
class RecomandacionService{
    private int $scoreMaximo = 100;
    private int $scoreMinimo = 40;

    public function puntuarContenido(array $preferencias, array $candidatos, array $generosFavoritos, array $perfilResenas = []): array{
        $score = 0;
        $motivos = [];

        $reglas = [
            function() use ($preferencias, $candidatos, $perfilResenas, &$motivos){
                // 1) Tipo de contenido coincide con las preferencias del usuario (30 puntos)
                $tipoPreferido = $preferencias['tipo_preferido'] ?? 'ambos';
                $tipoCandidato = $candidatos['tipo'] ?? '';
                if($tipoPreferido === 'ambos' || $tipoPreferido === $tipoCandidato){
                    $motivos[] = "El tipo de contenido coincide";
                    return 30;
                }
                if(isset($perfilResenas['tipo'][$tipoCandidato]['avg']) && $perfilResenas['tipo'][$tipoCandidato]['avg'] >= 3){
                    $motivos[] = "Tus reseñas muestran interes por este tipo";
                    return 15;
                }
                return 0;
            },
            function() use ($preferencias, $candidatos, &$motivos){
                // 2) Duracion/temporadas coincide (25 puntos)
                $tipo = $candidatos['tipo'] ?? '';
                if($tipo === 'pelicula'){
                    $d = (int)($candidatos['duracion'] ?? 0);
                    $dPref = $preferencias['duracion_preferida'] ?? 'indiferente';

                    if($dPref === 'indiferente') return 10;
                    if($dPref === 'corta' && $d > 0 && $d <= 100){ $motivos[] = "Duracion corta"; return 25; }
                    if($dPref === 'media' && $d > 101 && $d <= 140){ $motivos[] = "Duracion media"; return 25; }
                    if($dPref === 'larga' && $d > 140){ $motivos[] = "Duracion larga"; return 25; }
                    return 0;
                }
                
                if($tipo === 'serie'){
                    $t = (int)($candidatos['numero_temporadas'] ?? 0);
                    $tPref = $preferencias['max_temporadas'] ?? 'indiferente';

                    if($tPref === 'indiferente') return 10;
                    if($tPref === '1' && $t === 1){ $motivos[] = "1 temporada"; return 25; }
                    if($tPref === '2-3' && $t >= 2 && $t <= 3){ $motivos[] = "2-3 temporadas"; return 25; }
                    if($tPref === '4+' && $t >= 4){ $motivos[] = "4 o más temporadas"; return 25; }
                    return 0;
                }
                return 0;
            },
            function() use ($preferencias, $candidatos, $generosFavoritos, &$motivos){
                // 3) Generos coinciden (24 puntos max 6 puntos por genero)
                $generosContenidoTmdb = $candidatos['genre_ids'] ?? []; // devuelve array de IDs de generos de un contenido segun TMDB
                $generosContenidoLocal = $this->mapearGenerosTmdb($generosContenidoTmdb);

                $coinciden = array_intersect($generosFavoritos, $generosContenidoLocal);
                $num = count($coinciden); // calcula cuantos generos coinciden con los del usuario

                if($num > 0){
                    $motivos[] = "Coinciden generos";
                    $puntos = min(24, $num * 6);
                    return $puntos;
                }

                return 0;
            },
            function() use ($candidatos, $perfilResenas, &$motivos){
                // 4) Ajuste por reseñas (suave, no excluye contenido)
                return $this->ajustePorResenas($candidatos, $perfilResenas, $motivos);
            },
            function() use ($preferencias, $candidatos, &$motivos){
                // 5) Popularidad (15 puntos max)
                $pref = $preferencias['preferencia_popularidad'] ?? 'indiferente';
                $popularidad = (float)($candidatos['popularidad'] ?? $candidatos['vote_average'] ?? 0);
                
                if($pref === 'indiferente') return 5;
                if($pref === 'popular' && $popularidad >= 8.0){ $motivos[] = "Popular"; return 15; }
                if($pref === 'poco_conocido' && $popularidad < 7.0){ $motivos[] = "Poco conocido"; return 15; }
                return 0;
            }
        ];

        foreach($reglas as $regla){
            $score += $regla();
        }

        $score = max(0, min($this->scoreMaximo, $score));

        return [
            'score' => $score,
            'recomendable' => $score >= $this->scoreMinimo,
            'motivo' => $motivos
        ];
    }

    public function obtenerRecomendaciones(array $preferencias, array $catalogo, array $generosFavoritos, int $limite = 6, array $perfilResenas = []): array{
        $recomendaciones = [];
        $puntuadas = [];
        foreach($catalogo as $contenido){
            $puntuacion = $this->puntuarContenido($preferencias, $contenido, $generosFavoritos, $perfilResenas);
            $item = [
                'contenido' => $contenido,
                'puntuacion' => $puntuacion['score'],
                'motivo' => $puntuacion['motivo']
            ];
            $puntuadas[] = $item;
            if($puntuacion['recomendable']){
                $recomendaciones[] = $item;
            }
        }
        usort($recomendaciones, function($a, $b){
            return $b['puntuacion'] <=> $a['puntuacion'];
        });
        if(!empty($recomendaciones)){
            return array_slice($recomendaciones, 0, $limite);
        }
        usort($puntuadas, function($a, $b){
            return $b['puntuacion'] <=> $a['puntuacion'];
        });
        return array_slice($puntuadas, 0, $limite);
    }

    private function ajustePorResenas(array $candidato, array $perfilResenas, array &$motivos): int{
        if(empty($perfilResenas)){
            return 0;
        }

        $ajuste = 0;
        $tipo = $candidato['tipo'] ?? '';

        if(isset($perfilResenas['tipo'][$tipo]['avg'])){
            $ajuste += $this->deltaPorPromedio((float)$perfilResenas['tipo'][$tipo]['avg'], 2.0);
        }

        $generos = $this->mapearGenerosTmdb($candidato['genre_ids'] ?? []);
        $ajusteGeneros = 0.0;
        foreach($generos as $generoId){
            $clave = (string)$generoId;
            if(isset($perfilResenas['generos'][$clave]['avg'])){
                $ajusteGeneros += $this->deltaPorPromedio((float)$perfilResenas['generos'][$clave]['avg'], 1.5);
            }
        }
        $ajusteGeneros = max(-6.0, min(6.0, $ajusteGeneros));
        $ajuste += $ajusteGeneros;

        if($tipo === 'pelicula'){
            $duracion = (int)($candidato['duracion'] ?? 0);
            $bucket = $this->bucketDuracion($duracion);
            if($bucket !== '' && isset($perfilResenas['duracion'][$bucket]['avg'])){
                $ajuste += $this->deltaPorPromedio((float)$perfilResenas['duracion'][$bucket]['avg'], 1.5);
            }
        }

        if($tipo === 'serie'){
            $temporadas = (int)($candidato['numero_temporadas'] ?? 0);
            $bucket = $this->bucketTemporadas($temporadas);
            if($bucket !== '' && isset($perfilResenas['temporadas'][$bucket]['avg'])){
                $ajuste += $this->deltaPorPromedio((float)$perfilResenas['temporadas'][$bucket]['avg'], 1.5);
            }
        }

        $ajuste = (int)round(max(-12.0, min(12.0, $ajuste)));

        if($ajuste > 0){
            $motivos[] = "Tus reseñas sugieren afinidad";
        }elseif($ajuste < 0){
            $motivos[] = "Tus reseñas sugieren menos afinidad";
        }

        return $ajuste;
    }

    private function deltaPorPromedio(float $promedio, float $factor): float{
        return ($promedio - 3.0) * $factor;
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