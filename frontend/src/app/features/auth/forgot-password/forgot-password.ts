import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading = false;
  error = '';
  success = false;

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    const fd = new FormData();
    fd.append('action', 'solicitarRecuperacionContrasena');
    fd.append('email', this.form.getRawValue().email!);

    this.http.post<any>('/api', fd, { responseType: 'text' as 'json' }).subscribe({
      next: (raw: any) => {
        try {
          const clean = (raw as string).substring((raw as string).indexOf('{'));
          const res = JSON.parse(clean);
          if (res.success) {
            this.success = true;
          } else {
            this.error = res.message || 'Error al enviar el correo';
          }
        } catch {
          this.error = 'Error inesperado';
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
