import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { map } from 'rxjs';
import { LoadingComponent } from '../../shared/loading/loading';
import { AuthService } from '../../core/services/auth';

type Tipo = 'pelicula' | 'serie';
type ListaTab = 'viendo' | 'pendientes' | null;

@Component({
  selector: 'app-content-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, LoadingComponent],
  templateUrl: './content-detail.html',
  styleUrl: './content-detail.css',
})
export class ContentDetail {
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

  enLista: ListaTab = null;

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

    this.cargarDetalle();
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

  toggleLista(lista: 'viendo' | 'pendientes'): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.enLista = this.enLista === lista ? null : lista;
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
    fd.append('duracion', String(this.duracion ?? ''));
    fd.append('numero_temporadas', String(this.numeroTemporadas ?? ''));
    fd.append('popularidad', String(this.popularidad ?? ''));

    this.postParsed(fd).subscribe({
      next: () =>
        this.router.navigate(['/review/new'], { queryParams: { tipo: this.tipo, id: this.id } }),
      error: () =>
        this.router.navigate(['/review/new'], { queryParams: { tipo: this.tipo, id: this.id } }),
    });
  }
}
