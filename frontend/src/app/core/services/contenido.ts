import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type CatalogoTipo = 'ambos' | 'pelicula' | 'serie';
export type TipoContenido = 'pelicula' | 'serie';

export interface CatalogoItemUI {
  externalId: number;
  tipo: TipoContenido | string;
  titulo: string;
  fecha: string | null;
  posterUrl: string | null;

  overview?: string;
  popularity?: number;
  voteAverage?: number;
  genreIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class ContenidoService {
  private readonly API_URL = '/api';
  private readonly TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

  constructor(private http: HttpClient) {}

  /** Helper para convertir poster_path -> URL completa */
  toPosterUrl(posterPath: any): string | null {
    if (!posterPath) return null;
    const s = String(posterPath);
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    if (s.startsWith('/')) return `${this.TMDB_IMG}${s}`;
    return `${this.TMDB_IMG}/${s}`;
  }

  /** POST que devuelve texto, recorta JSON y lo parsea (por si hay warnings/BOM) */
  postParsed(formData: FormData): Observable<any> {
    return this.http.post(this.API_URL, formData, { responseType: 'text' }).pipe(
      map((text: string) => {
        const cleaned = (text ?? '').replace(/^\uFEFF/, '').trim();
        const first = cleaned.indexOf('{');
        const last = cleaned.lastIndexOf('}');
        if (first === -1 || last === -1 || last <= first) {
          throw new Error('Respuesta sin JSON válido (no se encontró objeto JSON).');
        }
        const jsonStr = cleaned.slice(first, last + 1);
        return JSON.parse(jsonStr);
      }),
    );
  }

  // ---------- CATALOGO TMDB (backend: obtenerCatalogoTmdb) ----------
  obtenerCatalogoTmdb(tipo: CatalogoTipo = 'ambos', pagina = 1): Observable<CatalogoItemUI[]> {
    const formData = new FormData();
    formData.append('action', 'obtenerCatalogoTmdb');
    formData.append('tipo', tipo);
    formData.append('pagina', String(pagina));

    return this.postParsed(formData).pipe(
      map((res: any) => {
        if (!res?.success) throw new Error(res?.message ?? 'Error del backend');

        const raw = res?.catalogo ?? [];
        if (!Array.isArray(raw)) return [];

        return raw.map((it: any) => this.mapCatalogoToUI(it)).filter(Boolean) as CatalogoItemUI[];
      }),
    );
  }

  private mapCatalogoToUI(it: any): CatalogoItemUI | null {
    const externalId = Number(it?.tmdb_id ?? 0);
    if (!externalId || Number.isNaN(externalId)) return null;

    const tipo = (it?.tipo ?? '').toString();
    const titulo = (it?.titulo ?? 'Sin título').toString();
    const fecha = (it?.fecha ?? null) as string | null;

    const posterUrl = this.toPosterUrl(it?.poster_path ?? null);

    return {
      externalId,
      tipo,
      titulo,
      fecha,
      posterUrl,
      overview: it?.overview ?? '',
      popularity: Number(it?.popularity ?? 0),
      voteAverage: Number(it?.vote_average ?? 0),
      genreIds: Array.isArray(it?.genre_ids) ? it.genre_ids : [],
    };
  }

  // ---------- DETALLE BD (backend: obtenerDetalleDeBd) ----------
  obtenerDetalleDeBd(external_id: number, tipo: TipoContenido): Observable<any> {
    const formData = new FormData();
    formData.append('action', 'obtenerDetalleDeBd');
    formData.append('external_id', String(external_id));
    formData.append('tipo', tipo);

    return this.postParsed(formData);
  }

  // ---------- DETALLE TMDB (backend: obtenerDetalleTmdb) ----------
  obtenerDetalleTmdb(tmdbId: number, tipo: TipoContenido): Observable<any> {
    const formData = new FormData();
    formData.append('action', 'obtenerDetalleTmdb');
    formData.append('tmdbId', String(tmdbId));
    formData.append('tipo', tipo);

    return this.postParsed(formData);
  }

  // ---------- BUSCAR TMDB (backend: buscarContenidoTmdb) ----------
  buscarContenidoTmdb(
    texto: string,
    tipo: CatalogoTipo = 'ambos',
    pagina = 1,
  ): Observable<CatalogoItemUI[]> {
    const formData = new FormData();
    formData.append('action', 'buscarContenidoTmdb');
    formData.append('texto', texto);
    formData.append('tipo', tipo);
    formData.append('pagina', String(pagina));

    return this.postParsed(formData).pipe(
      map((res: any) => {
        if (!res?.success) throw new Error(res?.message ?? 'Error del backend');
        const raw = res?.catalogo ?? [];
        if (!Array.isArray(raw)) return [];
        return raw.map((it: any) => this.mapCatalogoToUI(it)).filter(Boolean) as CatalogoItemUI[];
      }),
    );
  }
}
