import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { ContenidoService } from '../../../core/services/contenido';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  contenido = inject(ContenidoService);

  get user() {
    return this.auth.currentUser() ?? null;
  }
  resenas: any[] = [];
  todasResenas: any[] = [];
  mostrarTodas = false;
  loadingResenas = false;
  totalResenas = 0;

  totalViendo = 0;
  totalPendientes = 0;
  totalCompletadas = 0;

  ngOnInit(): void {
    this.cargarUltimasResenas();
    this.cargarStatsListas();
  }

  cargarUltimasResenas(): void {
    this.loadingResenas = true;

    const fd = new FormData();
    fd.append('action', 'ultimasResenasDeUsuario');
    fd.append('limite', '5');

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) this.resenas = res.resenas ?? [];
        this.loadingResenas = false;
      },
      error: () => {
        this.loadingResenas = false;
      },
    });

    const fd2 = new FormData();
    fd2.append('action', 'obtenerTodasResenasDeUsuario');

    this.contenido.postParsed(fd2).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.todasResenas = res.resenas ?? [];
          this.totalResenas = this.todasResenas.length;
        }
      },
    });
  }

  cargarStatsListas(): void {
    const fd = new FormData();
    fd.append('action', 'obtenerListasDeUsuario');

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) {
          const listas = res.listas ?? [];
          listas.forEach((lista: any) => {
            this.cargarConteoLista(lista.id, lista.nombre.toLowerCase());
          });
        }
      },
    });
  }

  private cargarConteoLista(listaId: number, nombre: string): void {
    const fd = new FormData();
    fd.append('action', 'obtenerContenidosDeLista');
    fd.append('lista_id', String(listaId));

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        const count = (res?.contenidos ?? []).length;
        if (nombre === 'viendo') this.totalViendo = count;
        if (nombre === 'pendiente') this.totalPendientes = count;
        if (nombre === 'completado') this.totalCompletadas = count;
      },
    });
  }

  eliminarResena(id: number): void {
    if (!confirm('¿Seguro que quieres eliminar esta reseña?')) return;

    const fd = new FormData();
    fd.append('action', 'eliminarResena');
    fd.append('id', String(id));

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.resenas = this.resenas.filter((r) => r.id !== id);
          this.todasResenas = this.todasResenas.filter((r) => r.id !== id);
          this.totalResenas = this.todasResenas.length;
        }
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

  get resenasVisibles(): any[] {
    return this.mostrarTodas ? this.todasResenas : this.resenas;
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
  verDetalle(resena: any): void {
    const fd = new FormData();
    fd.append('action', 'obtenerDetalleDeBd');
    fd.append('external_id', String(resena.contenido_id));
    fd.append('tipo', resena.tipo_contenido);

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success && res.detalle?.external_id) {
          this.router.navigate(['/content', resena.tipo_contenido, res.detalle.external_id]);
        }
      },
    });
  }
  toPosterUrl(poster: string | null): string | null {
    return this.contenido.toPosterUrl(poster);
  }
}
