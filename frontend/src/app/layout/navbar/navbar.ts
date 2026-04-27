import { Component, inject, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  auth = inject(AuthService);
  get user() {
    return this.auth.currentUser();
  }
  menuOpen = false;
  mobileOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMobile(): void {
    this.mobileOpen = false;
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
    this.closeMobile();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.navbar-user')) {
      this.menuOpen = false;
    }
    if (!target.closest('.navbar-mobile-btn') && !target.closest('.navbar-mobile-menu')) {
      this.mobileOpen = false;
    }
  }

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
