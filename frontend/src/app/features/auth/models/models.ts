export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  avatar?: string;
  fecha_registro?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
}

export interface RegisterResponse extends ApiResponse {}

export interface LoginResponse extends ApiResponse {
  usuario?: User;
}

export interface SesionActualResponse extends ApiResponse {
  usuario?: User;
}

export interface BackendResponse {
  success: boolean;
  message?: string;
}

export interface CatalogoResponse extends BackendResponse {
  catalogo?: RawCatalogoItem[];
}

export interface DetalleResponse extends BackendResponse {
  detalle?: RawDetalle;
  contenido?: RawDetalle;
}

export interface RawCatalogoItem {
  tmdb_id?: number;
  tipo?: string;
  titulo?: string;
  fecha?: string;
  poster_path?: string;
  overview?: string;
  popularity?: number;
  vote_average?: number;
  genre_ids?: number[];
}

export interface RawDetalle {
  id?: number;
  external_id?: string | number;
  titulo?: string;
  tipo?: string;
  sinopsis?: string;
  poster?: string;
  fecha_lanzamiento?: string;
  duracion?: number;
  numero_temporadas?: number;
  popularidad?: number;
  title?: string;
  name?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  number_of_seasons?: number;
  vote_average?: number;
  poster_path?: string;
}

export interface RecuperacionContrasenaResponse extends BackendResponse {}

export interface PreferenciaResponse extends BackendResponse {}

export interface Genero {
  id: number;
  nombre: string;
}

export interface RestablecerContrasenaResponse extends BackendResponse {}

export interface VerificarCorreoResponse extends BackendResponse {}

export interface Lista {
  id: number;
  nombre: string;
  tipo_lista: string;
}

export interface Contenido {
  id: number;
  external_id: string | number;
  titulo: string;
  tipo: string;
  sinopsis?: string;
  poster?: string;
  fecha_lanzamiento?: string;
  duracion?: number;
  numero_temporadas?: number;
  popularidad?: number;
}

export interface ListasUsuarioResponse extends BackendResponse {
  listas?: Lista[];
}

export interface ContenidosListaResponse extends BackendResponse {
  contenidos?: Contenido[];
}

export interface GuardarContenidoResponse extends BackendResponse {
  contenido_id?: number;
}

export interface ListaAccionResponse extends BackendResponse {}

export interface PosterItem {
  titulo: string;
  tipo: string;
  id: number;
  url: string | null;
}

export interface Resena {
  id: number;
  contenido_id: number;
  external_id?: number | string;
  puntuacion: number;
  comentario?: string;
  fecha_creacion: string;
  titulo_contenido: string;
  poster_contenido: string | null;
  tipo_contenido: string;
}

export interface ResenasResponse extends BackendResponse {
  resenas?: Resena[];
}

export interface FavoritosResponse extends BackendResponse {
  resena_favorita?: Resena[];
}

export interface CrearResenaResponse extends BackendResponse {}

export interface EditarResenaResponse extends BackendResponse {
  resena?: Resena;
}

export interface RecomendacionContenido {
  tmdb_id: number;
  tipo: string;
  titulo: string;
  fecha?: string;
  poster_path?: string;
  overview?: string;
  popularity?: number;
  vote_average?: number;
  duracion?: number;
  numero_temporadas?: number;
  genre_ids?: number[];
}

export interface RecomendacionItem {
  contenido: RecomendacionContenido;
  puntuacion: number;
  motivo: string[];
}

export interface RecomendacionesResponse extends BackendResponse {
  recomendaciones?: RecomendacionItem[];
}
