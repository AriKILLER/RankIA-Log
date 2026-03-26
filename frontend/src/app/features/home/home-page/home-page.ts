import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ContenidoService, CatalogoItemUI, CatalogoTipo } from '../../../core/services/contenido';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  auth = inject(AuthService);
  contenido = inject(ContenidoService);

  tipoCatalogo: CatalogoTipo = 'ambos';
  catalogo: CatalogoItemUI[] = [];
  loadingCatalogo = false;
  catalogoError = '';

  constructor() {
    this.cargarCatalogo('ambos');
  }

  setTipo(tipo: CatalogoTipo): void {
    if (this.tipoCatalogo === tipo) return;
    this.cargarCatalogo(tipo);
  }

  cargarCatalogo(tipo: CatalogoTipo): void {
    this.tipoCatalogo = tipo;
    this.loadingCatalogo = true;
    this.catalogoError = '';

    this.contenido.obtenerCatalogoTmdb(tipo, 1).subscribe({
      next: (items) => {
        this.catalogo = items;
        this.loadingCatalogo = false;
      },
      error: (err) => {
        console.error('Catalogo error:', err);

        this.catalogoError = err?.error?.message ?? err?.message ?? 'Error al cargar el catálogo';

        this.loadingCatalogo = false;
      },
    });
  }
}
