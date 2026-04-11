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

  ngOnInit(): void {
    this.cargarUltimasResenas();
  }

  cargarUltimasResenas(): void {
    this.loadingResenas = true;
    const fd = new FormData();
    fd.append('action', 'ultimasResenasDeUsuario');
    fd.append('limite', '5');

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.resenas = res.resenas ?? [];
        }
        this.loadingResenas = false;
      },
      error: () => {
        this.loadingResenas = false;
      },
    });

    // Stats: total de reseñas
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
    const index = nombre.charCodeAt(0) % colors.length;
    return colors[index];
  }

  toPosterUrl(poster: string | null): string | null {
    return this.contenido.toPosterUrl(poster);
  }
}
