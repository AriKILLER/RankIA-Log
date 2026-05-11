import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContenidoService } from '../../../core/services/contenido';
import { VerificarCorreoResponse } from '../models/models';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private contenido = inject(ContenidoService);

  loading = true;
  success = false;
  error = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.error = 'Token de verificación no válido o expirado.';
      this.loading = false;
      return;
    }

    const fd = new FormData();
    fd.append('action', 'verificarCorreo');
    fd.append('token', token);

    this.contenido.postParsed(fd).subscribe({
      next: (res: VerificarCorreoResponse) => {
        if (res.success) {
          this.success = true;
        } else {
          this.error = res.message ?? 'No se pudo verificar la cuenta.';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al conectar con el servidor.';
        this.loading = false;
      },
    });
  }
}
