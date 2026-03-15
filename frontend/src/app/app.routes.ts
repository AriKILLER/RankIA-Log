import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

import { HomePage } from './features/home/home-page/home-page';
import { SearchPage } from './features/search/search-page/search-page';
import { ProfilePage } from './features/profile/profile-page/profile-page';
import { ListsPage } from './features/lists/lists-page/lists-page';
import { RecommendationsPage } from './features/recommendations/recommendations-page/recommendations-page';

export const routes: Routes = [
  // Rutas públicas
  { path: 'login',       loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'register',    loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
  { path: 'preferences', loadComponent: () => import('./features/auth/preferences/preferences').then(m => m.Preferences) },

  // Rutas protegidas
  { path: '',                canActivate: [authGuard], component: HomePage },
  { path: 'search',          canActivate: [authGuard], component: SearchPage },
  { path: 'profile',         canActivate: [authGuard], component: ProfilePage },
  { path: 'lists',           canActivate: [authGuard], component: ListsPage },
  { path: 'recommendations', canActivate: [authGuard], component: RecommendationsPage },
];