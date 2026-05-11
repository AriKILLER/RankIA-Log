import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContenidoService } from '../../../core/services/contenido';
import { RestablecerContrasenaResponse } from '../models/models';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private contenido = inject(ContenidoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = '';

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  loading = false;
  success = false;
  error = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.error = 'Token inválido o expirado.';
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { password, confirmPassword } = this.form.getRawValue();

    if (password !== confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.error = '';

    const fd = new FormData();
    fd.append('action', 'restablecerContrasena');
    fd.append('token', this.token);
    fd.append('nueva_contrasena', password!);

    this.contenido.postParsed(fd).subscribe({
      next: (res: RestablecerContrasenaResponse) => {
        if (res.success) {
          this.success = true;
          setTimeout(() => this.router.navigate(['/login']), 3000);
        } else {
          this.error = res.message ?? 'No se pudo restablecer la contraseña.';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al conectar con el servidor.';
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
