import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../../features/auth/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
private readonly API_URL = '/api';
  private readonly USER_KEY = 'rankia_user';

  private currentUserSignal = signal<User | null>(this.loadUserFromStorage());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn  = computed(() => this.currentUserSignal() !== null);

  constructor(private http: HttpClient, private router: Router) {}

  register(nombre: string, email: string, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('action', 'registroUsuario');
    formData.append('nombre', nombre);
    formData.append('email', email);
    formData.append('password', password);

    return this.http.post<any>(this.API_URL, formData);
  }

  login(email: string, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('action', 'inicioSesion');
    formData.append('email', email);
    formData.append('password', password);

    return this.http.post<any>(this.API_URL, formData).pipe(
      tap(res => {
        if (res.success) this.persistSession(res.usuario);
      })
    );
  }

  logout(): void {
    const formData = new FormData();
    formData.append('action', 'cerrarSesion');

    this.http.post<any>(this.API_URL, formData).subscribe();
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  private persistSession(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}