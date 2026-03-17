import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    nombre:   ['', [Validators.required, Validators.minLength(3)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loading = false;
  error   = '';

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error   = '';

    const { nombre, email, password } = this.form.getRawValue();

    this.auth.register(nombre!, email!, password!).subscribe({
      next: res => {
        if (res.success) {
          this.router.navigate(['/preferences']);
        } else {
          this.error   = res.message;
          this.loading = false;
        }
      },
      error: () => {
        this.error   = 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  get nombre()   { return this.form.get('nombre')!; }
  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
}