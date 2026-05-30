import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ContenidoService } from '../../../core/services/contenido';
import { DetalleResponse, PosterItem, RawDetalle } from '../../auth/models/models';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  auth = inject(AuthService);
  contenido = inject(ContenidoService);

  posters: PosterItem[] = [
    { titulo: 'Breaking Bad', tipo: 'serie', id: 1396, url: null },
    { titulo: 'Oppenheimer', tipo: 'pelicula', id: 872585, url: null },
    { titulo: 'Dune', tipo: 'pelicula', id: 438631, url: null },
  ];

  ngOnInit(): void {
    this.posters.forEach((p, i) => {
      const fd = new FormData();
      fd.append('action', 'obtenerDetalleTmdb');
      fd.append('tmdbId', String(p.id));
      fd.append('tipo', p.tipo);

      this.contenido.postParsed(fd).subscribe({
        next: (res: DetalleResponse) => {
          const d = res?.contenido ?? res?.detalle ?? (res as RawDetalle);
          const path = d?.poster ?? d?.poster_path ?? null;
          this.posters[i] = { ...this.posters[i], url: this.contenido.toPosterUrl(path) };
        },
        error: () => {},
      });
    });
  }
}
