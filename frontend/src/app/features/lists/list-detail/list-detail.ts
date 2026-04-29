import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContenidoService } from '../../../core/services/contenido';

interface ListItem {
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
  private contenido = inject(ContenidoService);

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

    const fd = new FormData();
    fd.append('action', 'obtenerListasDeUsuario');

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) {
          const lista = res.listas.find((l: any) => l.id === this.listaId);
          if (lista) this.nombreLista = lista.nombre;
        }
      },
    });

    const fd2 = new FormData();
    fd2.append('action', 'obtenerContenidosDeLista');
    fd2.append('lista_id', String(this.listaId));

    this.contenido.postParsed(fd2).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.items = (res.contenidos ?? []).map((c: any) => ({
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
        this.error = 'Error al cargar la lista';
        this.loading = false;
      },
    });
  }

  quitarDeLista(item: ListItem): void {
    const fd = new FormData();
    fd.append('action', 'eliminarLista');
    fd.append('id', String(this.listaId));
    fd.append('contenido_id', String(item.contenidoId));

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.items = this.items.filter((i) => i.contenidoId !== item.contenidoId);
        }
      },
    });
  }

  eliminarLista(): void {
    if (!confirm('¿Seguro que quieres eliminar esta lista?')) return;

    const fd = new FormData();
    fd.append('action', 'eliminarLista');
    fd.append('id', String(this.listaId));

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
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
