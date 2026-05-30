import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
export class SearchPage implements OnInit, OnDestroy {
  private contenido = inject(ContenidoService);
  private router = inject(Router);

  query = '';
  selectedFiltro: CatalogoTipo = 'ambos';
  catalogo: CatalogoItemUI[] = [];
  loading = false;
  loadingMas = false;
  error = '';
  paginaActual = 1;
  hayMas = true;

  filtros: { key: CatalogoTipo; label: string }[] = [
    { key: 'ambos', label: '🎭 Ambos' },
    { key: 'pelicula', label: '🎬 Películas' },
    { key: 'serie', label: '📺 Series' },
  ];

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const estado = this.contenido.estadoBusqueda;
    if (estado.catalogo.length > 0) {
      this.catalogo = estado.catalogo;
      this.query = estado.query;
      this.selectedFiltro = estado.filtro;
    } else {
      this.cargarCatalogo();
    }
  }

  ngOnDestroy(): void {
    this.contenido.estadoBusqueda = {
      catalogo: this.catalogo,
      query: this.query,
      filtro: this.selectedFiltro,
      scrollY: 0,
    };
  }

  cargarCatalogo(): void {
    this.loading = true;
    this.error = '';
    this.query = '';
    this.paginaActual = 1;
    this.hayMas = true;

    this.contenido.obtenerCatalogoTmdb(this.selectedFiltro, 1).subscribe({
      next: (items: CatalogoItemUI[]) => {
        this.catalogo = this.eliminarDuplicados(items);
        this.hayMas = items.length >= 60;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el catálogo';
        this.loading = false;
      },
    });
  }

  cargarMas(): void {
    if (this.loadingMas || !this.hayMas) return;
    this.loadingMas = true;
    this.paginaActual++;

    this.contenido.obtenerCatalogoTmdb(this.selectedFiltro, this.paginaActual).subscribe({
      next: (items: CatalogoItemUI[]) => {
        const nuevos = this.eliminarDuplicados([...this.catalogo, ...items]);
        this.hayMas = items.length >= 60;
        this.catalogo = nuevos;
        this.loadingMas = false;
      },
      error: () => {
        this.loadingMas = false;
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
        this.catalogo = this.eliminarDuplicados(items);
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al buscar contenido';
        this.loading = false;
      },
    });
  }

  private eliminarDuplicados(items: CatalogoItemUI[]): CatalogoItemUI[] {
    const vistos = new Set<string>();
    return items.filter((item) => {
      const clave = `${item.externalId}-${item.tipo}`;
      if (vistos.has(clave)) return false;
      vistos.add(clave);
      return true;
    });
  }
  limpiarBusqueda(): void {
    this.query = '';
    this.cargarCatalogo();
  }

  irADetalle(item: CatalogoItemUI): void {
    this.router.navigate(['/content', item.tipo, item.externalId]);
  }
}
