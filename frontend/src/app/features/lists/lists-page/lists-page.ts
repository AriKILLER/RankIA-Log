import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ContenidoService, CatalogoItemUI } from '../../../core/services/contenido';

type ListTab = 'viendo' | 'pendientes' | 'completadas';

interface ListItem {
  externalId: number;
  tipo: string;
  titulo: string;
  fecha: string | null;
  posterUrl: string | null;
  rating?: string;
}

@Component({
  selector: 'app-lists-page',
  standalone: true,
  imports: [],
  templateUrl: './lists-page.html',
  styleUrl: './lists-page.css',
})
export class ListsPage {
  private contenido = inject(ContenidoService);
  private router = inject(Router);

  tabs: { key: ListTab; label: string }[] = [
    { key: 'viendo', label: '👀 Viendo' },
    { key: 'pendientes', label: '⏳ Pendientes' },
    { key: 'completadas', label: '✅ Completadas' },
  ];

  activeTab: ListTab = 'viendo';
  loading = false;

  // IDs de TMDB para demo
  private demoIds = {
    viendo: [
      { id: 1396, tipo: 'serie' as const },
      { id: 76479, tipo: 'serie' as const },
    ],
    pendientes: [
      { id: 157336, tipo: 'pelicula' as const },
      { id: 438631, tipo: 'pelicula' as const },
      { id: 872585, tipo: 'pelicula' as const },
    ],
    completadas: [
      { id: 1396, tipo: 'serie' as const },
      { id: 1399, tipo: 'serie' as const },
    ],
  };

  items: Record<ListTab, ListItem[]> = {
    viendo: [],
    pendientes: [],
    completadas: [],
  };

  ngOnInit(): void {
    this.cargarLista('viendo');
  }

  setTab(tab: ListTab): void {
    this.activeTab = tab;
    if (this.items[tab].length === 0) {
      this.cargarLista(tab);
    }
  }

  cargarLista(tab: ListTab): void {
    this.loading = true;
    const ids = this.demoIds[tab];

    const resultados: ListItem[] = [];
    let completados = 0;

    ids.forEach((entry, i) => {
      const fd = new FormData();
      fd.append('action', 'obtenerDetalleTmdb');
      fd.append('tmdbId', String(entry.id));
      fd.append('tipo', entry.tipo);

      this.contenido.postParsed(fd).subscribe({
        next: (res: any) => {
          const d = res?.contenido ?? res?.detalle ?? res;
          resultados[i] = {
            externalId: entry.id,
            tipo: entry.tipo,
            titulo: d?.titulo ?? d?.title ?? d?.name ?? 'Sin título',
            fecha: d?.fecha_lanzamiento ?? d?.release_date ?? d?.first_air_date ?? null,
            posterUrl: this.contenido.toPosterUrl(d?.poster ?? d?.poster_path ?? null),
          };
          completados++;
          if (completados === ids.length) {
            this.items[tab] = resultados.filter(Boolean);
            this.loading = false;
          }
        },
        error: () => {
          completados++;
          if (completados === ids.length) {
            this.items[tab] = resultados.filter(Boolean);
            this.loading = false;
          }
        },
      });
    });
  }

  get currentItems(): ListItem[] {
    return this.items[this.activeTab];
  }

  irADetalle(item: ListItem): void {
    this.router.navigate(['/content', item.tipo, item.externalId]);
  }

  resenar(item: ListItem): void {
    this.router.navigate(['/review/new'], {
      queryParams: { tipo: item.tipo, id: item.externalId },
    });
  }
}
