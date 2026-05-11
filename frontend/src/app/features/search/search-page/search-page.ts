import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../../shared/loading/loading';
import { ContenidoService, CatalogoItemUI, CatalogoTipo } from '../../../core/services/contenido';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [FormsModule, LoadingComponent],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css',
})
export class SearchPage implements OnInit {
  private contenido = inject(ContenidoService);
  private router = inject(Router);

  query = '';

  filtros: { key: CatalogoTipo; label: string }[] = [
    { key: 'ambos', label: '🎭 Ambos' },
    { key: 'pelicula', label: '🎬 Películas' },
    { key: 'serie', label: '📺 Series' },
  ];

  selectedFiltro: CatalogoTipo = 'ambos';
  catalogo: CatalogoItemUI[] = [];
  loading = false;
  error = '';

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    this.loading = true;
    this.error = '';
    this.query = '';

    this.contenido.obtenerCatalogoTmdb(this.selectedFiltro).subscribe({
      next: (items: CatalogoItemUI[]) => {
        this.catalogo = items;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el catálogo';
        this.loading = false;
      },
    });
  }

  selectFiltro(filtro: CatalogoTipo): void {
    this.selectedFiltro = filtro;
    if (this.query.trim()) {
      this.buscar();
    } else {
      this.cargarCatalogo();
    }
  }

  onSearch(): void {
    const q = this.query.trim();

    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    if (!q) {
      this.cargarCatalogo();
      return;
    }

    this.searchTimeout = setTimeout(() => this.buscar(), 500);
  }

  private buscar(): void {
    this.loading = true;
    this.error = '';

    this.contenido.buscarContenidoTmdb(this.query.trim(), this.selectedFiltro).subscribe({
      next: (items: CatalogoItemUI[]) => {
        this.catalogo = items;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al buscar contenido';
        this.loading = false;
      },
    });
  }

  irADetalle(item: CatalogoItemUI): void {
    this.router.navigate(['/content', item.tipo, item.externalId]);
  }
}
