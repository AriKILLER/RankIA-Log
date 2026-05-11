import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { User } from '../auth/models/models';

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
    return this.ticketForm.get('asunto')!;
  }
  get descripcion() {
    return this.ticketForm.get('descripcion')!;
  }
}
