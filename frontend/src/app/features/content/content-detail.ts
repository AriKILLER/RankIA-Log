import { Component, inject, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { LoadingComponent } from '../../shared/loading/loading';
import { AuthService } from '../../core/services/auth';
import { ContenidoService } from '../../core/services/contenido';
import { ListaService } from '../../core/services/lista';
import { FormsModule } from '@angular/forms';
import {
  Lista,
  RawDetalle,
  ListasUsuarioResponse,
  ContenidosListaResponse,
  GuardarContenidoResponse,
  DetalleResponse,
} from '../../features/auth/models/models';

type Tipo = 'pelicula' | 'serie';

@Component({
  selector: 'app-content-detail',
  standalone: true,
  imports: [DecimalPipe, LoadingComponent, FormsModule],
  templateUrl: './content-detail.html',
  styleUrl: './content-detail.css',
})
export class ContentDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private contenido = inject(ContenidoService);
  private listas = inject(ListaService);
  auth = inject(AuthService);

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

  listaViendo: number | null = null;
  listaPendiente: number | null = null;
  listaCompletado: number | null = null;

  enViendo = false;
  enPendiente = false;
  enCompletado = false;
  loadingLista = false;

  listasPersonalizadas: Lista[] = [];
  listasConContenido: number[] = [];
  mostrarDropdown = false;

  mostrarFormNuevaLista = false;
  nombreNuevaListaDetalle = '';
  errorNuevaListaDetalle = '';
  loadingNuevaListaDetalle = false;

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.mostrarDropdown = false;
      this.mostrarFormNuevaLista = false;
    }
  }

  private toPosterUrl(posterPath: string | null | undefined): string | null {
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

    this.contenido.postParsed(fdBd).subscribe({
      next: (res: DetalleResponse) => {
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

    this.contenido.postParsed(fd).subscribe({
      next: (res: DetalleResponse) => {
        if (res?.success === false) {
          this.error = res?.message ?? 'Error al cargar detalle';
          this.loading = false;
          return;
        }
        const d = res?.detalle ?? res;
        this.aplicarDetalle(d as RawDetalle);
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err?.message ?? 'Error al cargar detalle';
        this.loading = false;
      },
    });
  }

  private aplicarDetalle(d: RawDetalle): void {
    this.titulo = d?.titulo ?? d?.title ?? d?.name ?? 'Sin título';
    this.fecha = d?.fecha_lanzamiento ?? d?.release_date ?? d?.first_air_date ?? null;
    this.sinopsis = d?.sinopsis ?? d?.overview ?? '';
    this.posterUrl = this.toPosterUrl(d?.poster ?? d?.poster_path ?? null);
    this.duracion = d?.duracion ?? d?.runtime ?? null;
    this.numeroTemporadas = d?.numero_temporadas ?? d?.number_of_seasons ?? null;
    this.popularidad = d?.vote_average ?? d?.popularidad ?? null;
  }

  private cargarListas(): void {
    this.listas.obtenerListasDeUsuario().subscribe({
      next: (res: ListasUsuarioResponse) => {
        if (res?.success) {
          const listasTodas: Lista[] = res.listas ?? [];
          listasTodas.forEach((lista: Lista) => {
            const nombre = lista.nombre.toLowerCase();
            if (nombre === 'viendo') this.listaViendo = lista.id;
            if (nombre === 'pendiente') this.listaPendiente = lista.id;
            if (nombre === 'completado') this.listaCompletado = lista.id;
          });
          this.listasPersonalizadas = listasTodas.filter(
            (l: Lista) => l.tipo_lista === 'personalizada',
          );
          if (this.contenidoId) {
            this.comprobarEnListas();
            this.comprobarEnListasPersonalizadas();
          }
        }
      },
    });
  }

  private comprobarEnListas(): void {
    if (this.listaViendo) {
      this.listas.obtenerContenidosDeLista(this.listaViendo).subscribe({
        next: (res: ContenidosListaResponse) => {
          this.enViendo = this.listas.estaContenidoEnLista(res?.contenidos ?? [], this.id);
        },
      });
    }
    if (this.listaPendiente) {
      this.listas.obtenerContenidosDeLista(this.listaPendiente).subscribe({
        next: (res: ContenidosListaResponse) => {
          this.enPendiente = this.listas.estaContenidoEnLista(res?.contenidos ?? [], this.id);
        },
      });
    }
    if (this.listaCompletado) {
      this.listas.obtenerContenidosDeLista(this.listaCompletado).subscribe({
        next: (res: ContenidosListaResponse) => {
          this.enCompletado = this.listas.estaContenidoEnLista(res?.contenidos ?? [], this.id);
        },
      });
    }
  }

  private comprobarEnListasPersonalizadas(): void {
    this.listasPersonalizadas.forEach((lista: Lista) => {
      this.listas.obtenerContenidosDeLista(lista.id).subscribe({
        next: (res: ContenidosListaResponse) => {
          const estaEnLista = this.listas.estaContenidoEnLista(res?.contenidos ?? [], this.id);
          if (estaEnLista && !this.listasConContenido.includes(lista.id)) {
            this.listasConContenido.push(lista.id);
          }
        },
      });
    });
  }

  private guardarContenidoEnBd(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.listas
        .guardarContenidoEnBd(
          this.id,
          this.titulo,
          this.tipo,
          this.sinopsis,
          this.posterUrl ?? '',
          this.fecha ?? '',
          this.duracion ?? 0,
          this.numeroTemporadas ?? 0,
          this.popularidad ?? 0,
        )
        .subscribe({
          next: (res: GuardarContenidoResponse) => {
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

  async toggleLista(tipo: 'viendo' | 'pendientes' | 'completado'): Promise<void> {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadingLista = true;
    if (!this.contenidoId) {
      try {
        await this.guardarContenidoEnBd();
      } catch {
        this.loadingLista = false;
        return;
      }
    }
    const listaId =
      tipo === 'viendo'
        ? this.listaViendo
        : tipo === 'pendientes'
          ? this.listaPendiente
          : this.listaCompletado;
    const enLista =
      tipo === 'viendo'
        ? this.enViendo
        : tipo === 'pendientes'
          ? this.enPendiente
          : this.enCompletado;
    if (!listaId) {
      this.loadingLista = false;
      return;
    }
    this.listas.toggleContenidoEnLista(listaId, this.contenidoId!, enLista).subscribe({
      next: (res) => {
        if (res?.success) {
          if (tipo === 'viendo') this.enViendo = !this.enViendo;
          if (tipo === 'pendientes') this.enPendiente = !this.enPendiente;
          if (tipo === 'completado') this.enCompletado = !this.enCompletado;
        }
        this.loadingLista = false;
      },
      error: () => {
        this.loadingLista = false;
      },
    });
  }

  async toggleListaPersonalizada(lista: Lista): Promise<void> {
    if (!this.contenidoId) {
      try {
        await this.guardarContenidoEnBd();
      } catch {
        return;
      }
    }
    const estaEnLista = this.listasConContenido.includes(lista.id);
    this.listas.toggleContenidoEnLista(lista.id, this.contenidoId!, estaEnLista).subscribe({
      next: (res) => {
        if (res?.success) {
          if (estaEnLista) {
            this.listasConContenido = this.listasConContenido.filter((id) => id !== lista.id);
          } else {
            this.listasConContenido.push(lista.id);
          }
        }
      },
    });
  }

  resenar(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.listas
      .guardarContenidoEnBd(
        this.id,
        this.titulo,
        this.tipo,
        this.sinopsis,
        this.posterUrl ?? '',
        this.fecha ?? '',
        this.duracion ?? 0,
        this.numeroTemporadas ?? 0,
        this.popularidad ?? 0,
      )
      .subscribe({
        next: () =>
          this.router.navigate(['/review/new'], { queryParams: { tipo: this.tipo, id: this.id } }),
        error: () =>
          this.router.navigate(['/review/new'], { queryParams: { tipo: this.tipo, id: this.id } }),
      });
  }

  crearListaDesdeDetalle(): void {
    if (!this.nombreNuevaListaDetalle.trim()) return;
    this.loadingNuevaListaDetalle = true;
    this.errorNuevaListaDetalle = '';

    this.listas.crearLista(this.nombreNuevaListaDetalle.trim()).subscribe({
      next: (res) => {
        if (res?.success) {
          this.nombreNuevaListaDetalle = '';
          this.mostrarFormNuevaLista = false;
          this.cargarListas();
        } else {
          this.errorNuevaListaDetalle = res?.message ?? 'Error al crear la lista';
        }
        this.loadingNuevaListaDetalle = false;
      },
      error: () => {
        this.errorNuevaListaDetalle = 'Error al conectar con el servidor';
        this.loadingNuevaListaDetalle = false;
      },
    });
  }

  volver(): void {
    this.location.back();
  }
}
