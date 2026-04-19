import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  contenido = inject(ContenidoService);
  user = this.auth.currentUser() ?? null;

  resenas: any[] = [];
  todasResenas: any[] = [];
  mostrarTodas = false;
  loadingResenas = false;
  totalResenas = 0;

  // Stats de listas
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
            const nombre = lista.nombre.toLowerCase();
            this.cargarConteoLista(lista.id, nombre);
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

  verTodas(): void {
    this.mostrarTodas = true;
  }
  verMenos(): void {
    this.mostrarTodas = false;
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

  toPosterUrl(poster: string | null): string | null {
    return this.contenido.toPosterUrl(poster);
  }
}
