import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import {
  BackendResponse,
  CatalogoResponse,
  DetalleResponse,
  RecomendacionesResponse,
  RawCatalogoItem,
} from '../../features/auth/models/models';

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

  private readonly cacheCatalogo = new Map<string, CatalogoItemUI[]>();
  private readonly cacheBusqueda = new Map<string, CatalogoItemUI[]>();
  private readonly cacheRecomendaciones = new Map<string, RecomendacionesResponse>();

  estadoBusqueda: {
    catalogo: CatalogoItemUI[];
    query: string;
    filtro: CatalogoTipo;
    scrollY: number;
  } = { catalogo: [], query: '', filtro: 'ambos', scrollY: 0 };

  constructor(private http: HttpClient) {}

  toPosterUrl(posterPath: string | null | undefined): string | null {
    if (!posterPath) return null;
    const s = String(posterPath);
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    if (s.startsWith('/')) return `${this.TMDB_IMG}${s}`;
    return `${this.TMDB_IMG}/${s}`;
  }

  postParsed(formData: FormData): Observable<BackendResponse> {
    return this.http.post(this.API_URL, formData, { responseType: 'text' }).pipe(
      map((text: string) => {
        const cleaned = (text ?? '').replace(/^\uFEFF/, '').trim();
        const first = cleaned.indexOf('{');
        const last = cleaned.lastIndexOf('}');
        if (first === -1 || last === -1 || last <= first) {
          throw new Error('Respuesta sin JSON válido (no se encontró objeto JSON).');
        }
        const jsonStr = cleaned.slice(first, last + 1);
        return JSON.parse(jsonStr) as BackendResponse;
      }),
    );
  }

  obtenerCatalogoTmdb(
    tipo: CatalogoTipo = 'ambos',
    pagina = 1,
    useCache = true,
  ): Observable<CatalogoItemUI[]> {
    const cacheKey = `catalogo:${tipo}:${pagina}`;
    if (useCache && this.cacheCatalogo.has(cacheKey)) {
      return of(this.cacheCatalogo.get(cacheKey) ?? []);
    }

    const formData = new FormData();
    formData.append('action', 'obtenerCatalogoTmdb');
    formData.append('tipo', tipo);
    formData.append('pagina', String(pagina));

    return this.postParsed(formData).pipe(
      map((res: CatalogoResponse) => {
        if (!res?.success) throw new Error(res?.message ?? 'Error del backend');
        const raw = res?.catalogo ?? [];
        if (!Array.isArray(raw)) return [];
        const mapped = raw
          .map((it) => this.mapCatalogoToUI(it))
          .filter(Boolean) as CatalogoItemUI[];
        this.cacheCatalogo.set(cacheKey, mapped);
        return mapped;
      }),
    );
  }

  private mapCatalogoToUI(it: RawCatalogoItem): CatalogoItemUI | null {
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

  obtenerDetalleDeBd(external_id: number, tipo: TipoContenido): Observable<DetalleResponse> {
    const formData = new FormData();
    formData.append('action', 'obtenerDetalleDeBd');
    formData.append('external_id', String(external_id));
    formData.append('tipo', tipo);

    return this.postParsed(formData) as Observable<DetalleResponse>;
  }

  obtenerDetalleTmdb(tmdbId: number, tipo: TipoContenido): Observable<DetalleResponse> {
    const formData = new FormData();
    formData.append('action', 'obtenerDetalleTmdb');
    formData.append('tmdbId', String(tmdbId));
    formData.append('tipo', tipo);

    return this.postParsed(formData) as Observable<DetalleResponse>;
  }

  buscarContenidoTmdb(
    texto: string,
    tipo: CatalogoTipo = 'ambos',
    pagina = 1,
    useCache = true,
  ): Observable<CatalogoItemUI[]> {
    const cacheKey = `buscar:${tipo}:${pagina}:${texto.trim().toLowerCase()}`;
    if (useCache && this.cacheBusqueda.has(cacheKey)) {
      return of(this.cacheBusqueda.get(cacheKey) ?? []);
    }

    const formData = new FormData();
    formData.append('action', 'buscarContenidoTmdb');
    formData.append('texto', texto);
    formData.append('tipo', tipo);
    formData.append('pagina', String(pagina));

    return this.postParsed(formData).pipe(
      map((res: CatalogoResponse) => {
        if (!res?.success) throw new Error(res?.message ?? 'Error del backend');
        const raw = res?.catalogo ?? [];
        if (!Array.isArray(raw)) return [];
        const mapped = raw
          .map((it) => this.mapCatalogoToUI(it))
          .filter(Boolean) as CatalogoItemUI[];
        this.cacheBusqueda.set(cacheKey, mapped);
        return mapped;
      }),
    );
  }

  obtenerRecomendaciones(
    limite = 6,
    tipo: CatalogoTipo = 'ambos',
    useCache = true,
  ): Observable<RecomendacionesResponse> {
    const cacheKey = `recomendaciones:${tipo}:${limite}`;
    if (useCache && this.cacheRecomendaciones.has(cacheKey)) {
      return of(this.cacheRecomendaciones.get(cacheKey) as RecomendacionesResponse);
    }

    const formData = new FormData();
    formData.append('action', 'obtenerRecomendaciones');
    formData.append('limite', String(limite));
    if (tipo !== 'ambos') {
      formData.append('tipo', tipo);
    }

    return this.postParsed(formData).pipe(
      map((res: RecomendacionesResponse) => {
        if (res?.success) {
          this.cacheRecomendaciones.set(cacheKey, res);
        }
        return res;
      }),
    ) as Observable<RecomendacionesResponse>;
  }
  limpiarCache(): void {
    this.cacheCatalogo.clear();
    this.cacheBusqueda.clear();
    this.cacheRecomendaciones.clear();
  }
}
