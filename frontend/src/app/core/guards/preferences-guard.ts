import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';
import { BackendResponse } from '../../features/auth/models/models';

export const preferencesGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const http = inject(HttpClient);

  if (!auth.isLoggedIn()) return true;

  const fd = new FormData();
  fd.append('action', 'obtenerPreferenciasUsuario');

  return http.post<BackendResponse & { preferencias: unknown }>('/api', fd).pipe(
    map((res) => {
      if (res?.success && res?.preferencias) {
        router.navigate(['']);
        return false;
      }
      return true;
    }),
    catchError(() => of(true)),
  );
};
