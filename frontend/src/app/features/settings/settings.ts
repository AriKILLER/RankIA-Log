import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  auth = inject(AuthService);
  user = this.auth.currentUser() ?? null;

  getAvatarColor(nombre: string): string {
    const colors = [
      '#e63946', '#2a9d8f', '#e9c46a', '#f4a261',
      '#457b9d', '#6a4c93', '#e76f51', '#2ec4b6'
    ];
    const index = nombre.charCodeAt(0) % colors.length;
    return colors[index];
  }
}