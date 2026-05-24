import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ListaService } from '../../../core/services/lista';
import {
  Lista,
  Contenido,
  ListasUsuarioResponse,
  ContenidosListaResponse,
  BackendResponse,
} from '../../auth/models/models';

interface Resena {
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

interface ResenasResponse extends BackendResponse {
  resenas?: Resena[];
}

interface FavoritosResponse extends BackendResponse {
  resena_favorita?: Resena[];
}

interface EliminarResenaResponse extends BackendResponse {}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  private listaSvc = inject(ListaService);

  get user() {
    return this.auth.currentUser() ?? null;
  }

  favoritos: Resena[] = [];
  resenas: Resena[] = [];
  todasResenas: Resena[] = [];
  mostrarTodas = false;
  filtroEstrellas: number = 0;
  loadingResenas = false;
  totalResenas = 0;

  totalViendo = 0;
  totalPendientes = 0;
  totalCompletadas = 0;

  contenidosViendo: Contenido[] = [];
  contenidosPendientes: Contenido[] = [];
  contenidosCompletadas: Contenido[] = [];

  listasPersonalizadas: Lista[] = [];
  mostrarFormNuevaLista = false;
  nombreNuevaLista = '';
  errorNuevaLista = '';
  loadingNuevaLista = false;
  carruselIndex = 0;
  carruselSize = 3;

  get listasPersonalizadasVisibles(): Lista[] {
    return this.listasPersonalizadas.slice(
      this.carruselIndex,
      this.carruselIndex + this.carruselSize,
    );
  }

  get resenasVisibles(): Resena[] {
    const base = this.mostrarTodas ? this.todasResenas : this.resenas;
    if (this.filtroEstrellas === 0) return base;
    return base.filter((r) => r.puntuacion === this.filtroEstrellas);
  }

  ngOnInit(): void {
    this.cargarUltimasResenas();
    this.cargarStatsListas();
    this.cargarFavoritos();
  }

  cargarUltimasResenas(): void {
    this.loadingResenas = true;

    const fd = new FormData();
    fd.append('action', 'ultimasResenasDeUsuario');
    fd.append('limite', '5');

    this.listaSvc['contenido'].postParsed(fd).subscribe({
      next: (res: ResenasResponse) => {
        if (res?.success) this.resenas = res.resenas ?? [];
        this.loadingResenas = false;
      },
      error: () => {
        this.loadingResenas = false;
      },
    });

    const fd2 = new FormData();
    fd2.append('action', 'obtenerTodasResenasDeUsuario');

    this.listaSvc['contenido'].postParsed(fd2).subscribe({
      next: (res: ResenasResponse) => {
        if (res?.success) {
          this.todasResenas = res.resenas ?? [];
          this.totalResenas = this.todasResenas.length;
        }
      },
    });
  }

  cargarStatsListas(): void {
    this.listaSvc.obtenerListasDeUsuario().subscribe({
      next: (res: ListasUsuarioResponse) => {
        if (res?.success) {
          const listas: Lista[] = res.listas ?? [];
          listas.forEach((lista: Lista) => {
            this.cargarConteoLista(lista.id, lista.nombre.toLowerCase());
          });
          this.listasPersonalizadas = listas.filter((l: Lista) => l.tipo_lista === 'personalizada');
        }
      },
    });
  }

  private cargarConteoLista(listaId: number, nombre: string): void {
    this.listaSvc.obtenerContenidosDeLista(listaId).subscribe({
      next: (res: ContenidosListaResponse) => {
        const contenidos: Contenido[] = res?.contenidos ?? [];
        const count = contenidos.length;
        if (nombre === 'viendo') {
          this.totalViendo = count;
          this.contenidosViendo = contenidos.slice(0, 3);
        }
        if (nombre === 'pendiente') {
          this.totalPendientes = count;
          this.contenidosPendientes = contenidos.slice(0, 3);
        }
        if (nombre === 'completado') {
          this.totalCompletadas = count;
          this.contenidosCompletadas = contenidos.slice(0, 3);
        }
      },
    });
  }

  cargarFavoritos(): void {
    const fd = new FormData();
    fd.append('action', 'obtenerResenaFavorita');
    fd.append('limite', '6');

    this.listaSvc['contenido'].postParsed(fd).subscribe({
      next: (res: FavoritosResponse) => {
        if (res?.success) this.favoritos = res.resena_favorita ?? [];
      },
    });
  }

  eliminarResena(id: number): void {
    if (!confirm('¿Seguro que quieres eliminar esta reseña?')) return;

    const fd = new FormData();
    fd.append('action', 'eliminarResena');
    fd.append('id', String(id));

    this.listaSvc['contenido'].postParsed(fd).subscribe({
      next: (res: EliminarResenaResponse) => {
        if (res?.success) {
          this.resenas = this.resenas.filter((r) => r.id !== id);
          this.todasResenas = this.todasResenas.filter((r) => r.id !== id);
          this.totalResenas = this.todasResenas.length;
        }
      },
    });
  }

  crearLista(): void {
    if (!this.nombreNuevaLista.trim()) return;
    this.loadingNuevaLista = true;
    this.errorNuevaLista = '';

    this.listaSvc.crearLista(this.nombreNuevaLista.trim()).subscribe({
      next: (res: BackendResponse) => {
        if (res?.success) {
          this.nombreNuevaLista = '';
          this.mostrarFormNuevaLista = false;
          this.cargarStatsListas();
        } else {
          this.errorNuevaLista = res?.message ?? 'Error al crear la lista';
        }
        this.loadingNuevaLista = false;
      },
      error: () => {
        this.errorNuevaLista = 'Error al conectar con el servidor';
        this.loadingNuevaLista = false;
      },
    });
  }

  verDetalle(resena: Resena): void {
    const id = resena.external_id ?? resena.contenido_id;
    this.router.navigate(['/content', resena.tipo_contenido, id]);
  }

  editarResena(resena: Resena, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/review/new'], {
      queryParams: {
        resenaId: resena.id,
        contenidoId: resena.contenido_id,
        puntuacion: resena.puntuacion,
        comentario: resena.comentario ?? '',
        titulo: resena.titulo_contenido,
        posterUrl: resena.poster_contenido ?? '',
      },
    });
  }

  verTodas(): void {
    this.mostrarTodas = true;
  }
  verMenos(): void {
    this.mostrarTodas = false;
  }

  scrollToResenas(): void {
    document.getElementById('resenas')?.scrollIntoView({ behavior: 'smooth' });
  }

  estrellas(puntuacion: number): string {
    return '★'.repeat(puntuacion) + '☆'.repeat(5 - puntuacion);
  }

  getAvatarColor(nombre: string): string {
    const colors = [
      '#e63946',
      '#2a9d8f',
      '#e9c46a',
      '#f4a261',
      '#457b9d',
      '#6a4c93',
      '#e76f51',
      '#2ec4b6',
    ];
    return colors[nombre.charCodeAt(0) % colors.length];
  }

  toPosterUrl(poster: string | null | undefined): string | null {
    return this.listaSvc.toPosterUrl(poster);
  }

  carruselAnterior(): void {
    if (this.carruselIndex > 0) this.carruselIndex--;
  }

  carruselSiguiente(): void {
    if (this.carruselIndex + this.carruselSize < this.listasPersonalizadas.length)
      this.carruselIndex++;
  }
}
