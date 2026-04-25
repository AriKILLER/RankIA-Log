import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  private readonly API_URL = '/api';

  loading = true;
  success = false;
  error = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.error = 'Token de verificación no válido.';
      this.loading = false;
      return;
    }
    this.verificar(token);
  }

  private verificar(token: string): void {
    const fd = new FormData();
    fd.append('action', 'verificarCorreo');
    fd.append('token', token);

    this.http
      .post(this.API_URL, fd, { responseType: 'text' })
      .pipe(
        map((text: string) => {
          const cleaned = (text ?? '').replace(/^\uFEFF/, '').trim();
          const first = cleaned.indexOf('{');
          const last = cleaned.lastIndexOf('}');
          if (first === -1 || last === -1) throw new Error('Respuesta inválida');
          return JSON.parse(cleaned.slice(first, last + 1));
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.success = true;
          } else {
            this.error = res.message ?? 'Error al verificar el email';
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Error al conectar con el servidor';
          this.loading = false;
        },
      });
  }
}
