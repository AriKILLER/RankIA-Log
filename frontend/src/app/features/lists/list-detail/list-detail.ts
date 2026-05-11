import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListaService } from '../../../core/services/lista';
import {
  Lista,
  Contenido,
  ListasUsuarioResponse,
  ContenidosListaResponse,
  ListaAccionResponse,
} from '../../auth/models/models';

export interface ListItem {
  contenidoId: number;
  externalId: number;
  tipo: string;
  titulo: string;
  fecha: string | null;
  posterUrl: string | null;
}

@Component({
  selector: 'app-list-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './list-detail.html',
  styleUrl: './list-detail.css',
})
export class ListDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listas = inject(ListaService);

  listaId = 0;
  nombreLista = '';
  items: ListItem[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.listaId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarContenidos();
  }

  cargarContenidos(): void {
    this.loading = true;

    this.listas.obtenerListasDeUsuario().subscribe({
      next: (res: ListasUsuarioResponse) => {
        if (res?.success) {
          const lista = (res.listas ?? []).find((l: Lista) => l.id === this.listaId);
          if (lista) this.nombreLista = lista.nombre;
        }
      },
    });

    this.listas.obtenerContenidosDeLista(this.listaId).subscribe({
      next: (res: ContenidosListaResponse) => {
        if (res?.success) {
          this.items = (res.contenidos ?? []).map((c: Contenido) => ({
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
        this.error = 'Error al cargar la lista';
        this.loading = false;
      },
    });
  }

  quitarDeLista(item: ListItem): void {
    this.listas.toggleContenidoEnLista(this.listaId, item.contenidoId, true).subscribe({
      next: (res: ListaAccionResponse) => {
        if (res?.success) {
          this.items = this.items.filter((i) => i.contenidoId !== item.contenidoId);
        }
      },
    });
  }

  eliminarLista(): void {
    if (!confirm('¿Seguro que quieres eliminar esta lista?')) return;

    this.listas.eliminarLista(this.listaId).subscribe({
      next: (res: ListaAccionResponse) => {
        if (res?.success) {
          this.router.navigate(['/lists']);
        }
      },
    });
  }

  irADetalle(item: ListItem): void {
    this.router.navigate(['/content', item.tipo, item.externalId]);
  }
}
