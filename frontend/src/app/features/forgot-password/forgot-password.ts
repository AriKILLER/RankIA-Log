import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  private readonly API_URL = '/api';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading = false;
  success = false;
  error = '';

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const fd = new FormData();
    fd.append('action', 'solicitarRecuperacionContrasena');
    fd.append('email', this.form.value.email!);

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
            this.error = res.message ?? 'Error al enviar el correo';
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Error al conectar con el servidor';
          this.loading = false;
        },
      });
  }

  get email() {
    return this.form.get('email')!;
  }
}
