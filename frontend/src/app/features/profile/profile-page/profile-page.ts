import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  auth = inject(AuthService);
  user = this.auth.currentUser() ?? null;

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
    const index = nombre.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
