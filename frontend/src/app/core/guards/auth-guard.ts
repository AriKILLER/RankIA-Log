import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si ya hay usuario en memoria/localStorage, entra directo
  if (auth.isLoggedIn()) return true;

  // Si no, intenta recuperar sesión PHP desde backend
  return auth.sesionActual(true).pipe(
    map((user) => {
      if (user) return true;
      router.navigate(['/login']);
      return false;
    }),
  );
};
