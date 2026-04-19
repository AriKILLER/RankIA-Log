import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../../shared/loading/loading';
import { ContenidoService } from '../../../core/services/contenido';

type ListTab = 'viendo' | 'pendientes' | 'completadas';

interface ListItem {
  contenidoId: number;
  externalId: number;
  tipo: string;
  titulo: string;
  fecha: string | null;
  posterUrl: string | null;
}

interface Lista {
  id: number;
  nombre: string;
  tipo_lista: string;
}

@Component({
  selector: 'app-lists-page',
  standalone: true,
  imports: [LoadingComponent],
  templateUrl: './lists-page.html',
  styleUrl: './lists-page.css',
})
export class ListsPage implements OnInit {
  private contenido = inject(ContenidoService);
  private router = inject(Router);

  tabs: { key: ListTab; label: string }[] = [
    { key: 'viendo', label: '👀 Viendo' },
    { key: 'pendientes', label: '⏳ Pendientes' },
    { key: 'completadas', label: '✅ Completadas' },
  ];

  activeTab: ListTab = 'viendo';
  loading = false;
  error = '';

  // IDs de las listas predefinidas del backend
  listaIds: Record<ListTab, number | null> = {
    viendo: null,
    pendientes: null,
    completadas: null,
  };

  items: Record<ListTab, ListItem[]> = {
    viendo: [],
    pendientes: [],
    completadas: [],
  };

  ngOnInit(): void {
    this.cargarListas();
  }

  cargarListas(): void {
    this.loading = true;
    this.error = '';

    const fd = new FormData();
    fd.append('action', 'obtenerListasDeUsuario');

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) {
          const listas: Lista[] = res.listas ?? [];

          listas.forEach((lista: Lista) => {
            const nombre = lista.nombre.toLowerCase();
            if (nombre === 'viendo') {
              this.listaIds['viendo'] = lista.id;
            } else if (nombre === 'pendiente') {
              this.listaIds['pendientes'] = lista.id;
            } else if (nombre === 'completado') {
              this.listaIds['completadas'] = lista.id;
            }
          });

          this.cargarContenidosDeTab('viendo');
        } else {
          this.error = 'Error al cargar las listas';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Error al conectar con el servidor';
        this.loading = false;
      },
    });
  }

  cargarContenidosDeTab(tab: ListTab): void {
    const listaId = this.listaIds[tab];
    if (!listaId) {
      this.items[tab] = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    const fd = new FormData();
    fd.append('action', 'obtenerContenidosDeLista');
    fd.append('lista_id', String(listaId));

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) {
          const contenidos = res.contenidos ?? [];
          this.items[tab] = contenidos.map((c: any) => ({
            contenidoId: c.id,
            externalId: Number(c.external_id),
            tipo: c.tipo,
            titulo: c.titulo,
            fecha: c.fecha_lanzamiento ?? null,
            posterUrl: this.contenido.toPosterUrl(c.poster ?? null),
          }));
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  setTab(tab: ListTab): void {
    this.activeTab = tab;
    if (this.items[tab].length === 0) {
      this.cargarContenidosDeTab(tab);
    }
  }

  quitarDeLista(item: ListItem): void {
    const listaId = this.listaIds[this.activeTab];
    if (!listaId) return;

    const fd = new FormData();
    fd.append('action', 'eliminarContenidoDeLista');
    fd.append('lista_id', String(listaId));
    fd.append('contenido_id', String(item.contenidoId));

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.items[this.activeTab] = this.items[this.activeTab].filter(
            (i) => i.contenidoId !== item.contenidoId,
          );
        }
      },
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
