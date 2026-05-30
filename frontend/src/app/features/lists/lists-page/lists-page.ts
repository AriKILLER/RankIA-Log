import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingComponent } from '../../../shared/loading/loading';
import { FormsModule } from '@angular/forms';
import { ListaService } from '../../../core/services/lista';
import {
  Lista,
  Contenido,
  ListasUsuarioResponse,
  ContenidosListaResponse,
  ListaAccionResponse,
  BackendResponse,
} from '../../auth/models/models';

type ListTab = 'viendo' | 'pendientes' | 'completadas';

export interface ListItem {
  contenidoId: number;
  externalId: number;
  tipo: string;
  titulo: string;
  fecha: string | null;
  posterUrl: string | null;
}

@Component({
  selector: 'app-lists-page',
  standalone: true,
  imports: [LoadingComponent, FormsModule],
  templateUrl: './lists-page.html',
  styleUrl: './lists-page.css',
})
export class ListsPage implements OnInit {
  private listas = inject(ListaService);
  router = inject(Router);
  private route = inject(ActivatedRoute);

  tabs: { key: ListTab; label: string }[] = [
    { key: 'viendo', label: '👀 Viendo' },
    { key: 'pendientes', label: '⏳ Pendientes' },
    { key: 'completadas', label: '✅ Completadas' },
  ];

  activeTab: ListTab = 'viendo';
  loading = false;
  error = '';

  listasPersonalizadas: Lista[] = [];
  mostrarFormNuevaLista = false;
  nombreNuevaLista = '';
  errorNuevaLista = '';
  loadingNuevaLista = false;
  editandoListaId: number | null = null;
  nombreEditarLista = '';
  errorEditarLista = '';
  loadingEditarLista = false;

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
    const tab = this.route.snapshot.queryParamMap.get('tab') as ListTab;
    if (tab && ['viendo', 'pendientes', 'completadas'].includes(tab)) {
      this.activeTab = tab;
    }
    this.cargarListas();
  }

  cargarListas(): void {
    this.loading = true;
    this.error = '';

    this.listas.obtenerListasDeUsuario().subscribe({
      next: (res: ListasUsuarioResponse) => {
        if (res?.success) {
          const todasListas: Lista[] = res.listas ?? [];
          todasListas.forEach((lista: Lista) => {
            const nombre = lista.nombre.toLowerCase();
            if (nombre === 'viendo') this.listaIds['viendo'] = lista.id;
            if (nombre === 'pendiente') this.listaIds['pendientes'] = lista.id;
            if (nombre === 'completado') this.listaIds['completadas'] = lista.id;
          });
          this.listasPersonalizadas = todasListas.filter(
            (l: Lista) => l.tipo_lista === 'personalizada',
          );
          this.cargarContenidosDeTab(this.activeTab);
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
    this.listas.obtenerContenidosDeLista(listaId).subscribe({
      next: (res: ContenidosListaResponse) => {
        if (res?.success) {
          this.items[tab] = (res.contenidos ?? []).map((c: Contenido) => ({
            contenidoId: c.id,
            externalId: Number(c.external_id),
            tipo: c.tipo ?? '',
            titulo: c.titulo ?? '',
            fecha: c.fecha_lanzamiento ?? null,
            posterUrl: this.listas.toPosterUrl(c.poster ?? null),
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

    this.listas.toggleContenidoEnLista(listaId, item.contenidoId, true).subscribe({
      next: (res: ListaAccionResponse) => {
        if (res?.success) {
          this.items[this.activeTab] = this.items[this.activeTab].filter(
            (i) => i.contenidoId !== item.contenidoId,
          );
        }
      },
    });
  }

  crearLista(): void {
    if (!this.nombreNuevaLista.trim()) return;
    this.loadingNuevaLista = true;
    this.errorNuevaLista = '';

    this.listas.crearLista(this.nombreNuevaLista.trim()).subscribe({
      next: (res: BackendResponse) => {
        if (res?.success) {
          this.nombreNuevaLista = '';
          this.mostrarFormNuevaLista = false;
          this.cargarListas();
        } else {
          this.errorNuevaLista = res?.message ?? 'Error al crear la lista';
        }
        this.loadingNuevaLista = false;
      },
      error: () => {
        this.errorNuevaLista = 'Error al conectar con el servidor';
        this.loadingNuevaLista = false;
      },
    });
  }

  abrirEditarLista(lista: Lista, event: Event): void {
    event.stopPropagation();
    this.editandoListaId = lista.id;
    this.nombreEditarLista = lista.nombre;
    this.errorEditarLista = '';
  }

  guardarEditarLista(): void {
    if (!this.nombreEditarLista.trim() || !this.editandoListaId) return;
    this.loadingEditarLista = true;
    this.errorEditarLista = '';

    this.listas.editarLista(this.editandoListaId, this.nombreEditarLista.trim()).subscribe({
      next: (res: BackendResponse) => {
        if (res?.success) {
          this.editandoListaId = null;
          this.cargarListas();
        } else {
          this.errorEditarLista = res?.message ?? 'Error al editar la lista';
        }
        this.loadingEditarLista = false;
      },
      error: () => {
        this.errorEditarLista = 'Error al conectar con el servidor';
        this.loadingEditarLista = false;
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
