import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../../shared/loading/loading';
import { ContenidoService, CatalogoItemUI, CatalogoTipo } from '../../../core/services/contenido';
import { ListaService } from '../../../core/services/lista';
import { ResenasResponse, Resena } from '../../auth/models/models';
@Component({
  selector: 'app-recommendations-page',
  standalone: true,
  imports: [LoadingComponent],
  templateUrl: './recommendations-page.html',
  styleUrl: './recommendations-page.css',
})
export class RecommendationsPage implements OnInit {
  private contenido = inject(ContenidoService);
  private listaSvc = inject(ListaService);
  private router = inject(Router);

  catalogo: CatalogoItemUI[] = [];
  loading = false;
  error = '';

  tipoFavorito = '';
  razonTexto = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = '';
    this.catalogo = [];

    const fd = new FormData();
    fd.append('action', 'obtenerTodasResenasDeUsuario');

    this.listaSvc['contenido'].postParsed(fd).subscribe({
      next: (res: ResenasResponse) => {
        this.aplicarReglas(res?.resenas ?? []);
      },
      error: () => {
        this.cargarPopulares('ambos');
      },
    });
  }

  private aplicarReglas(resenas: Resena[]): void {
    if (resenas.length === 0) {
      this.razonTexto = 'Contenido popular para descubrir';
      this.tipoFavorito = 'ambos';
      this.cargarPopulares('ambos');
      return;
    }

    const altas = resenas.filter((r: Resena) => r.puntuacion >= 4);

    if (altas.length === 0) {
      this.razonTexto = 'Contenido popular para descubrir';
      this.tipoFavorito = 'ambos';
      this.cargarPopulares('ambos');
      return;
    }

    const peliculas = altas.filter((r: Resena) => r.tipo_contenido === 'pelicula').length;
    const series = altas.filter((r: Resena) => r.tipo_contenido === 'serie').length;

    let tipo: CatalogoTipo = 'ambos';

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
