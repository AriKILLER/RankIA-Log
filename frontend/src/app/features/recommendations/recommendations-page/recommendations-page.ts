import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ContenidoService, CatalogoItemUI } from '../../../core/services/contenido';

@Component({
  selector: 'app-recommendations-page',
  standalone: true,
  imports: [],
  templateUrl: './recommendations-page.html',
  styleUrl: './recommendations-page.css',
})
export class RecommendationsPage {
  private contenido = inject(ContenidoService);
  private router = inject(Router);

  catalogo: CatalogoItemUI[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = '';

    this.contenido.obtenerCatalogoTmdb('ambos').subscribe({
      next: (items) => {
        // Mezclamos y cogemos solo 6
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
