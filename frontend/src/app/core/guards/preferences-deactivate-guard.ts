import { CanDeactivateFn } from '@angular/router';
import { Preferences } from '../../features/auth/preferences/preferences';

export const preferencesDeactivateGuard: CanDeactivateFn<Preferences> = (component) => {
  if (component.preferenciasGuardadas) return true;
  component.mostrarAviso = true;
  return false;
};
