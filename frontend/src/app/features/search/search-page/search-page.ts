import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContenidoService, CatalogoItemUI, CatalogoTipo } from '../../../core/services/contenido';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css',
})
export class SearchPage {
  private contenido = inject(ContenidoService);
  private router    = inject(Router);

  query = '';

  filtros: { key: CatalogoTipo; label: string }[] = [
    { key: 'ambos',    label: '🎭 Ambos' },
    { key: 'pelicula', label: '🎬 Películas' },
    { key: 'serie',    label: '📺 Series' },
  ];

  selectedFiltro: CatalogoTipo = 'ambos';

  catalogo: CatalogoItemUI[]     = [];
  catalogoFull: CatalogoItemUI[] = [];
  loading = false;
  error   = '';

  ngOnInit(): void {
    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    this.loading = true;
    this.error   = '';
    this.query   = '';

    this.contenido.obtenerCatalogoTmdb(this.selectedFiltro).subscribe({
      next: items => {
        this.catalogoFull = items;
        this.catalogo     = items;
        this.loading      = false;
      },
      error: () => {
        this.error   = 'Error al cargar el catálogo';
        this.loading = false;
      }
    });
  }

  selectFiltro(filtro: CatalogoTipo): void {
    this.selectedFiltro = filtro;
    this.cargarCatalogo();
  }

  onSearch(): void {
    this.query = this.query.trim();
    if (!this.query) {
      this.catalogo = this.catalogoFull;
      return;
    }
    this.catalogo = this.catalogoFull.filter(item =>
      item.titulo.toLowerCase().includes(this.query.toLowerCase())
    );
  }

  irADetalle(item: CatalogoItemUI): void {
    this.router.navigate(['/content', item.tipo, item.externalId]);
  }
}