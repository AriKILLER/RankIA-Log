import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = false;
  error   = '';

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error   = '';

    this.auth.login(this.form.getRawValue() as any).subscribe({
      next: () => this.router.navigate(['']),
      error: err => {
        this.error   = err.error?.message ?? 'Email o contraseña incorrectos';
        this.loading = false;
      },
    });
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
}