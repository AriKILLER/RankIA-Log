import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../../shared/loading/loading';
import { ContenidoService, CatalogoItemUI } from '../../../core/services/contenido';

@Component({
  selector: 'app-recommendations-page',
  standalone: true,
  imports: [LoadingComponent],
  templateUrl: './recommendations-page.html',
  styleUrl: './recommendations-page.css',
})
export class RecommendationsPage implements OnInit {
  private contenido = inject(ContenidoService);
  private router = inject(Router);

  catalogo: CatalogoItemUI[] = [];
  loading = false;
  error = '';

  // Estadísticas para mostrar al usuario
  tipoFavorito: string = '';
  razonTexto: string = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = '';
    this.catalogo = [];

    // Primero obtenemos las reseñas del usuario
    const fd = new FormData();
    fd.append('action', 'obtenerTodasResenasDeUsuario');

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        const resenas = res?.resenas ?? [];
        this.aplicarReglas(resenas);
      },
      error: () => {
        // Si no hay sesión o falla, cargamos populares
        this.cargarPopulares('ambos');
      },
    });
  }

  private aplicarReglas(resenas: any[]): void {
    if (resenas.length === 0) {
      this.razonTexto = 'Contenido popular para descubrir';
      this.tipoFavorito = 'ambos';
      this.cargarPopulares('ambos');
      return;
    }

    // Reseñas con puntuación alta (4 o 5)
    const altas = resenas.filter((r: any) => r.puntuacion >= 4);

    if (altas.length === 0) {
      this.razonTexto = 'Contenido popular para descubrir';
      this.tipoFavorito = 'ambos';
      this.cargarPopulares('ambos');
      return;
    }

    // Contamos qué tipo le gusta más
    const peliculas = altas.filter((r: any) => r.tipo_contenido === 'pelicula').length;
    const series = altas.filter((r: any) => r.tipo_contenido === 'serie').length;

    let tipo: 'pelicula' | 'serie' | 'ambos' = 'ambos';

    if (peliculas > series) {
      tipo = 'pelicula';
      this.tipoFavorito = 'películas';
      this.razonTexto = `Basado en tus ${peliculas} reseñas de películas con puntuación alta`;
    } else if (series > peliculas) {
      tipo = 'serie';
      this.tipoFavorito = 'series';
      this.razonTexto = `Basado en tus ${series} reseñas de series con puntuación alta`;
    } else {
      tipo = 'ambos';
      this.tipoFavorito = 'películas y series';
      this.razonTexto = `Basado en tus ${altas.length} reseñas con puntuación alta`;
    }

    this.cargarPopulares(tipo);
  }

  private cargarPopulares(tipo: 'pelicula' | 'serie' | 'ambos'): void {
    this.contenido.obtenerCatalogoTmdb(tipo).subscribe({
      next: (items) => {
        const mezclado = items.sort(() => Math.random() - 0.5);
        this.catalogo = mezclado.slice(0, 6);
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar sugerencias';
        this.loading = false;
      },
    });
  }

  irADetalle(item: CatalogoItemUI): void {
    this.router.navigate(['/content', item.tipo, item.externalId]);
  }

  resenar(item: CatalogoItemUI): void {
    this.router.navigate(['/review/new'], {
      queryParams: { tipo: item.tipo, id: item.externalId },
    });
  }
}
