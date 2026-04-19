import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { map } from 'rxjs';
import { LoadingComponent } from '../../shared/loading/loading';
import { AuthService } from '../../core/services/auth';

type Tipo = 'pelicula' | 'serie';

@Component({
  selector: 'app-content-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, LoadingComponent],
  templateUrl: './content-detail.html',
  styleUrl: './content-detail.css',
})
export class ContentDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  auth = inject(AuthService);

  private readonly API_URL = '/api';
  private readonly TMDB_IMG = 'https://image.tmdb.org/t/p/w780';

  loading = true;
  error = '';

  tipo: Tipo = 'pelicula';
  id = 0;

  titulo = '';
  fecha: string | null = null;
  sinopsis = '';
  posterUrl: string | null = null;
  duracion: number | null = null;
  numeroTemporadas: number | null = null;
  popularidad: number | null = null;
  contenidoId: number | null = null;

  // IDs de listas predefinidas
  listaViendo: number | null = null;
  listaPendiente: number | null = null;

  // Estado actual en listas
  enViendo = false;
  enPendiente = false;
  loadingLista = false;

  constructor() {
    const tipoParam = (this.route.snapshot.paramMap.get('tipo') ?? 'pelicula') as Tipo;
    const idParam = Number(this.route.snapshot.paramMap.get('id') ?? 0);

    if (!idParam || (tipoParam !== 'pelicula' && tipoParam !== 'serie')) {
      this.error = 'Ruta inválida';
      this.loading = false;
      return;
    }

    this.tipo = tipoParam;
    this.id = idParam;
  }

  ngOnInit(): void {
    this.cargarDetalle();
    if (this.auth.isLoggedIn()) {
      this.cargarListas();
    }
  }

  private postParsed(formData: FormData) {
    return this.http.post(this.API_URL, formData, { responseType: 'text' }).pipe(
      map((text: string) => {
        const cleaned = (text ?? '').replace(/^\uFEFF/, '').trim();
        const first = cleaned.indexOf('{');
        const last = cleaned.lastIndexOf('}');
        if (first === -1 || last === -1 || last <= first) {
          throw new Error('Respuesta sin JSON válido.');
        }
        return JSON.parse(cleaned.slice(first, last + 1));
      }),
    );
  }

  private toPosterUrl(posterPath: any): string | null {
    if (!posterPath) return null;
    const s = String(posterPath);
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    if (s.startsWith('/')) return `${this.TMDB_IMG}${s}`;
    return `${this.TMDB_IMG}/${s}`;
  }

  private cargarDetalle(): void {
    this.loading = true;
    this.error = '';

    const fdBd = new FormData();
    fdBd.append('action', 'obtenerDetalleDeBd');
    fdBd.append('external_id', String(this.id));
    fdBd.append('tipo', this.tipo);

    this.postParsed(fdBd).subscribe({
      next: (res: any) => {
        if (res?.success && res?.detalle) {
          this.contenidoId = res.detalle.id ?? null;
          this.aplicarDetalle(res.detalle);
          this.loading = false;
        } else {
          this.cargarDesdeTmdb();
        }
      },
      error: () => this.cargarDesdeTmdb(),
    });
  }

  private cargarDesdeTmdb(): void {
    const fd = new FormData();
    fd.append('action', 'obtenerDetalleTmdb');
    fd.append('tmdbId', String(this.id));
    fd.append('tipo', this.tipo);

    this.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success === false) {
          this.error = res?.message ?? 'Error al cargar detalle';
          this.loading = false;
          return;
        }
        const d = res?.contenido ?? res?.detalle ?? res;
        this.aplicarDetalle(d);
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.message ?? 'Error al cargar detalle';
        this.loading = false;
      },
    });
  }

  private aplicarDetalle(d: any): void {
    this.titulo = d?.titulo ?? d?.title ?? d?.name ?? 'Sin título';
    this.fecha = d?.fecha_lanzamiento ?? d?.release_date ?? d?.first_air_date ?? d?.fecha ?? null;
    this.sinopsis = d?.sinopsis ?? d?.overview ?? d?.descripcion ?? '';
    this.posterUrl = this.toPosterUrl(d?.poster ?? d?.poster_path ?? null);
    this.duracion = d?.duracion ?? d?.runtime ?? null;
    this.numeroTemporadas = d?.numero_temporadas ?? d?.number_of_seasons ?? null;
    this.popularidad = d?.vote_average ?? d?.popularidad ?? null;
  }

  private cargarListas(): void {
    const fd = new FormData();
    fd.append('action', 'obtenerListasDeUsuario');

    this.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) {
          const listas = res.listas ?? [];
          listas.forEach((lista: any) => {
            const nombre = lista.nombre.toLowerCase();
            if (nombre === 'viendo') this.listaViendo = lista.id;
            if (nombre === 'pendiente') this.listaPendiente = lista.id;
          });
          // Comprobar si el contenido ya está en alguna lista
          if (this.contenidoId) this.comprobarEnListas();
        }
      },
    });
  }

  private comprobarEnListas(): void {
    if (this.listaViendo) {
      const fd = new FormData();
      fd.append('action', 'obtenerContenidosDeLista');
      fd.append('lista_id', String(this.listaViendo));
      this.postParsed(fd).subscribe({
        next: (res: any) => {
          const contenidos = res?.contenidos ?? [];
          this.enViendo = contenidos.some((c: any) => Number(c.external_id) === this.id);
        },
      });
    }
    if (this.listaPendiente) {
      const fd = new FormData();
      fd.append('action', 'obtenerContenidosDeLista');
      fd.append('lista_id', String(this.listaPendiente));
      this.postParsed(fd).subscribe({
        next: (res: any) => {
          const contenidos = res?.contenidos ?? [];
          this.enPendiente = contenidos.some((c: any) => Number(c.external_id) === this.id);
        },
      });
    }
  }

  private guardarContenidoEnBd(): Promise<number> {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('action', 'guardarDetalleEnBd');
      fd.append('external_id', String(this.id));
      fd.append('titulo', this.titulo);
      fd.append('tipo', this.tipo);
      fd.append('sinopsis', this.sinopsis);
      fd.append('poster', this.posterUrl ?? '');
      fd.append('fecha_lanzamiento', this.fecha ?? '');
      fd.append('duracion', String(this.duracion ?? 0));
      fd.append('numero_temporadas', String(this.numeroTemporadas ?? 0));
      fd.append('popularidad', String(this.popularidad ?? 0));

      this.postParsed(fd).subscribe({
        next: (res: any) => {
          if (res?.contenido_id) {
            this.contenidoId = res.contenido_id;
            resolve(res.contenido_id);
          } else {
            reject('No se pudo guardar el contenido');
          }
        },
        error: () => reject('Error al guardar contenido'),
      });
    });
  }

  async toggleLista(tipo: 'viendo' | 'pendientes'): Promise<void> {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadingLista = true;

    // Guardar contenido en BD si no tenemos contenidoId
    if (!this.contenidoId) {
      try {
        await this.guardarContenidoEnBd();
      } catch {
        this.loadingLista = false;
        return;
      }
    }

    const listaId = tipo === 'viendo' ? this.listaViendo : this.listaPendiente;
    const enLista = tipo === 'viendo' ? this.enViendo : this.enPendiente;

    if (!listaId) {
      this.loadingLista = false;
      return;
    }

    const action = enLista ? 'eliminarContenidoDeLista' : 'agregarContenidoALista';
    const fd = new FormData();
    fd.append('action', action);
    fd.append('lista_id', String(listaId));
    fd.append('contenido_id', String(this.contenidoId));

    this.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) {
          if (tipo === 'viendo') this.enViendo = !this.enViendo;
          if (tipo === 'pendientes') this.enPendiente = !this.enPendiente;
        }
        this.loadingLista = false;
      },
      error: () => {
        this.loadingLista = false;
      },
    });
  }

  resenar(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const fd = new FormData();
    fd.append('action', 'guardarDetalleEnBd');
    fd.append('external_id', String(this.id));
    fd.append('titulo', this.titulo);
    fd.append('tipo', this.tipo);
    fd.append('sinopsis', this.sinopsis);
    fd.append('poster', this.posterUrl ?? '');
    fd.append('fecha_lanzamiento', this.fecha ?? '');
    fd.append('duracion', String(this.duracion ?? 0));
    fd.append('numero_temporadas', String(this.numeroTemporadas ?? 0));
    fd.append('popularidad', String(this.popularidad ?? 0));

    this.postParsed(fd).subscribe({
      next: () =>
        this.router.navigate(['/review/new'], { queryParams: { tipo: this.tipo, id: this.id } }),
      error: () =>
        this.router.navigate(['/review/new'], { queryParams: { tipo: this.tipo, id: this.id } }),
    });
  }
}
