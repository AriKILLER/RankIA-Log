import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../../shared/loading/loading';
import { ContenidoService, CatalogoItemUI, CatalogoTipo } from '../../../core/services/contenido';
import { RecomendacionesResponse, RecomendacionItem } from '../../auth/models/models';

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
  razonTexto = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(useCache = true): void {
    this.loading = true;
    this.error = '';
    this.catalogo = [];
    if (!useCache) {
      this.contenido.limpiarCache();
    }

    this.contenido.obtenerRecomendaciones(6, 'ambos', useCache).subscribe({
      next: (res: RecomendacionesResponse) => {
        if (res?.success && res.recomendaciones && res.recomendaciones.length > 0) {
          this.razonTexto = 'Recomendaciones personalizadas basadas en tus preferencias y reseñas';
          this.catalogo = res.recomendaciones.map((r: RecomendacionItem) => ({
            externalId: r.contenido.tmdb_id,
            tipo: r.contenido.tipo,
            titulo: r.contenido.titulo,
            fecha: r.contenido.fecha ?? null,
            posterUrl: this.contenido.toPosterUrl(r.contenido.poster_path ?? null),
            overview: r.contenido.overview,
            popularity: r.contenido.popularity,
            voteAverage: r.contenido.vote_average,
          }));
          this.loading = false;
        } else {
          this.razonTexto = 'Contenido popular para descubrir';
          this.cargarPopulares('ambos');
        }
      },
      error: () => {
        this.razonTexto = 'Contenido popular para descubrir';
        this.cargarPopulares('ambos');
      },
    });
  }

  private cargarPopulares(tipo: CatalogoTipo): void {
    this.contenido.obtenerCatalogoTmdb(tipo).subscribe({
      next: (items: CatalogoItemUI[]) => {
        this.catalogo = items.sort(() => Math.random() - 0.5).slice(0, 6);
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
