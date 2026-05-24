import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, of } from 'rxjs';
import {
  User,
  ApiResponse,
  RegisterResponse,
  LoginResponse,
  SesionActualResponse,
  BackendResponse,
} from '../../features/auth/models/models';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = '/api';
  private readonly USER_KEY = 'rankia_user';

  private currentUserSignal = signal<User | null>(this.loadUserFromStorage());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  register(nombre: string, email: string, password: string): Observable<RegisterResponse> {
    const formData = new FormData();
    formData.append('action', 'registroUsuario');
    formData.append('nombre', nombre);
    formData.append('email', email);
    formData.append('password', password);

    return this.http.post<RegisterResponse>(this.API_URL, formData);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('action', 'inicioSesion');
    formData.append('email', email);
    formData.append('password', password);

    return this.http.post<LoginResponse>(this.API_URL, formData).pipe(
      tap((res) => {
        if (res.success && res.usuario) this.persistSession(res.usuario);
      }),
    );
  }

  sesionActual(comprobarPreferencias = false): Observable<User | null> {
    const formData = new FormData();
    formData.append('action', 'sesionActual');
    return this.http.post<SesionActualResponse>(this.API_URL, formData).pipe(
      map((res) => {
        if (res?.success && res?.usuario) {
          this.persistSession(res.usuario);
          if (comprobarPreferencias) {
            this.comprobarPreferenciasYRedirigir();
          }
          return res.usuario;
        }
        this.clearSession();
        return null;
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }
  comprobarPreferenciasYRedirigir(): void {
    const formData = new FormData();
    formData.append('action', 'obtenerPreferenciasUsuario');
    this.http.post<BackendResponse & { preferencias: unknown }>(this.API_URL, formData).subscribe({
      next: (res) => {
        if (res?.success && res?.preferencias) {
          this.router.navigate(['']);
        } else {
          this.router.navigate(['/preferences']);
        }
      },
      error: () => {
        this.router.navigate(['']);
      },
    });
  }

  logout(): void {
    const formData = new FormData();
    formData.append('action', 'cerrarSesion');

    this.http.post<ApiResponse>(this.API_URL, formData).subscribe();
    this.clearSession();
    this.router.navigate(['/']);
  }

  private persistSession(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
  }

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }
}
