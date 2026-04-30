import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingComponent } from '../../../shared/loading/loading';
import { FormsModule } from '@angular/forms';
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
  imports: [LoadingComponent, FormsModule],
  templateUrl: './lists-page.html',
  styleUrl: './lists-page.css',
})
export class ListsPage implements OnInit {
  private contenido = inject(ContenidoService);
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
  listasPersonalizadas: any[] = [];
  mostrarFormNuevaLista = false;
  nombreNuevaLista = '';
  errorNuevaLista = '';
  loadingNuevaLista = false;

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

    const fd = new FormData();
    fd.append('action', 'obtenerListasDeUsuario');

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) {
          const listas: Lista[] = res.listas ?? [];
          listas.forEach((lista: Lista) => {
            const nombre = lista.nombre.toLowerCase();
            if (nombre === 'viendo') this.listaIds['viendo'] = lista.id;
            if (nombre === 'pendiente') this.listaIds['pendientes'] = lista.id;
            if (nombre === 'completado') this.listaIds['completadas'] = lista.id;
          });
          this.listasPersonalizadas = listas.filter((l: Lista) => l.tipo_lista === 'personalizada');
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
    const fd = new FormData();
    fd.append('action', 'obtenerContenidosDeLista');
    fd.append('lista_id', String(listaId));

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.items[tab] = (res.contenidos ?? []).map((c: any) => ({
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
  crearLista(): void {
    if (!this.nombreNuevaLista.trim()) return;
    this.loadingNuevaLista = true;
    this.errorNuevaLista = '';

    const fd = new FormData();
    fd.append('action', 'crearLista');
    fd.append('nombre', this.nombreNuevaLista.trim());
    fd.append('tipo_lista', 'personalizada');

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
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
  irADetalle(item: ListItem): void {
    this.router.navigate(['/content', item.tipo, item.externalId]);
  }

  resenar(item: ListItem): void {
    this.router.navigate(['/review/new'], {
      queryParams: { tipo: item.tipo, id: item.externalId },
    });
  }
}
