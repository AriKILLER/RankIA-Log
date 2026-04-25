import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  private readonly API_URL = '/api';

  token = '';
  loading = false;
  success = false;
  error = '';

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.error = 'Token de recuperación no válido.';
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.error = '';

    const fd = new FormData();
    fd.append('action', 'restablecerContrasena');
    fd.append('token', this.token);
    fd.append('password', password!);

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
            setTimeout(() => this.router.navigate(['/login']), 2000);
          } else {
            this.error = res.message ?? 'Error al restablecer la contraseña';
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Error al conectar con el servidor';
          this.loading = false;
        },
      });
  }

  get password() {
    return this.form.get('password')!;
  }
  get confirmPassword() {
    return this.form.get('confirmPassword')!;
  }
}
