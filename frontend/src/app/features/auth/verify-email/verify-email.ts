import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

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

    this.http.post<any>('/api', fd, { responseType: 'text' as 'json' }).subscribe({
      next: (raw: any) => {
        try {
          const clean = (raw as string).substring((raw as string).indexOf('{'));
          const res = JSON.parse(clean);
          if (res.success) {
            this.success = true;
          } else {
            this.error = res.message || 'No se pudo verificar la cuenta.';
          }
        } catch {
          this.error = 'Error inesperado al verificar.';
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
