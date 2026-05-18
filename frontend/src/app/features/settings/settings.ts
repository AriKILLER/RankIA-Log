import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { User, BackendResponse } from '../auth/models/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  get user(): User | null {
    return this.auth.currentUser() ?? null;
  }

  ticketEnviado = false;
  ticketError = '';
  loadingTicket = false;

  ticketForm = this.fb.group({
    asunto: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(20)]],
  });

  editandoNombre = false;
  loadingNombre = false;
  errorNombre = '';
  nombreForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
  });

  editandoEmail = false;
  loadingEmail = false;
  errorEmail = '';
  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  editandoFoto = false;
  loadingFoto = false;
  errorFoto = '';
  fotoSeleccionada: File | null = null;

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
    return colors[nombre.charCodeAt(0) % colors.length];
  }

  abrirEditarNombre(): void {
    this.editandoNombre = true;
    this.errorNombre = '';
    this.nombreForm.patchValue({ nombre: this.user?.nombre ?? '' });
  }

  guardarNombre(): void {
    if (this.nombreForm.invalid) return;
    this.loadingNombre = true;
    this.errorNombre = '';
    this.loadingNombre = false;
    this.editandoNombre = false;
  }

  abrirEditarEmail(): void {
    this.editandoEmail = true;
    this.errorEmail = '';
    this.emailForm.patchValue({ email: this.user?.email ?? '' });
  }

  guardarEmail(): void {
    if (this.emailForm.invalid) return;
    this.loadingEmail = true;
    this.errorEmail = '';
    this.loadingEmail = false;
    this.editandoEmail = false;
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.fotoSeleccionada = input.files[0];
    }
  }

  guardarFoto(): void {
    if (!this.fotoSeleccionada) return;
    this.loadingFoto = true;
    this.errorFoto = '';
    this.loadingFoto = false;
    this.editandoFoto = false;
    this.fotoSeleccionada = null;
  }

  enviarTicket(): void {
    if (this.ticketForm.invalid) return;
    this.loadingTicket = true;
    this.ticketError = '';
    setTimeout(() => {
      this.ticketEnviado = true;
      this.loadingTicket = false;
      this.ticketForm.reset();
    }, 1000);
  }

  get asunto() {
    return this.ticketForm.controls['asunto'];
  }
  get descripcion() {
    return this.ticketForm.controls['descripcion'];
  }
  get nombre() {
    return this.nombreForm.controls['nombre'];
  }
  get email() {
    return this.emailForm.controls['email'];
  }
}
