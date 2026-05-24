import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContenidoService } from './contenido';
import {
  Lista,
  Contenido,
  ListasUsuarioResponse,
  ContenidosListaResponse,
  GuardarContenidoResponse,
  ListaAccionResponse,
  BackendResponse,
} from '../../features/auth/models/models';

@Injectable({ providedIn: 'root' })
export class ListaService {
  constructor(private contenido: ContenidoService) {}

  obtenerListasDeUsuario(): Observable<ListasUsuarioResponse> {
    const fd = new FormData();
    fd.append('action', 'obtenerListasDeUsuario');
    return this.contenido.postParsed(fd) as Observable<ListasUsuarioResponse>;
  }

  obtenerContenidosDeLista(listaId: number): Observable<ContenidosListaResponse> {
    const fd = new FormData();
    fd.append('action', 'obtenerContenidosDeLista');
    fd.append('lista_id', String(listaId));
    return this.contenido.postParsed(fd) as Observable<ContenidosListaResponse>;
  }

  guardarContenidoEnBd(
    externalId: number,
    titulo: string,
    tipo: string,
    sinopsis: string,
    posterUrl: string,
    fecha: string,
    duracion: number,
    numeroTemporadas: number,
    popularidad: number,
  ): Observable<GuardarContenidoResponse> {
    const fd = new FormData();
    fd.append('action', 'guardarDetalleEnBd');
    fd.append('external_id', String(externalId));
    fd.append('titulo', titulo);
    fd.append('tipo', tipo);
    fd.append('sinopsis', sinopsis);
    fd.append('poster', posterUrl);
    fd.append('fecha_lanzamiento', fecha);
    fd.append('duracion', String(duracion));
    fd.append('numero_temporadas', String(numeroTemporadas));
    fd.append('popularidad', String(popularidad));
    return this.contenido.postParsed(fd) as Observable<GuardarContenidoResponse>;
  }

  toggleContenidoEnLista(
    listaId: number,
    contenidoId: number,
    estaEnLista: boolean,
  ): Observable<ListaAccionResponse> {
    const action = estaEnLista ? 'eliminarContenidoDeLista' : 'agregarContenidoALista';
    const fd = new FormData();
    fd.append('action', action);
    fd.append('lista_id', String(listaId));
    fd.append('contenido_id', String(contenidoId));
    return this.contenido.postParsed(fd) as Observable<ListaAccionResponse>;
  }

  crearLista(nombre: string): Observable<BackendResponse> {
    const fd = new FormData();
    fd.append('action', 'crearLista');
    fd.append('nombre', nombre);
    fd.append('tipo_lista', 'personalizada');
    return this.contenido.postParsed(fd) as Observable<BackendResponse>;
  }

  eliminarLista(listaId: number): Observable<ListaAccionResponse> {
    const fd = new FormData();
    fd.append('action', 'eliminarLista');
    fd.append('id', String(listaId));
    return this.contenido.postParsed(fd) as Observable<ListaAccionResponse>;
  }

  editarLista(listaId: number, nuevoNombre: string): Observable<BackendResponse> {
    const fd = new FormData();
    fd.append('action', 'editarLista');
    fd.append('id', String(listaId));
    fd.append('nuevo_nombre', nuevoNombre);
    return this.contenido.postParsed(fd) as Observable<BackendResponse>;
  }

  estaContenidoEnLista(contenidos: Contenido[], externalId: number): boolean {
    return contenidos.some((c: Contenido) => Number(c.external_id) === externalId);
  }

  toPosterUrl(posterPath: string | null | undefined): string | null {
    return this.contenido.toPosterUrl(posterPath);
  }
}
