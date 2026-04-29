import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { HomePage } from './features/home/home-page/home-page';
import { SearchPage } from './features/search/search-page/search-page';
import { ProfilePage } from './features/profile/profile-page/profile-page';
import { ListsPage } from './features/lists/lists-page/lists-page';
import { RecommendationsPage } from './features/recommendations/recommendations-page/recommendations-page';

export const routes: Routes = [
  // Rutas públicas
  { path: '', component: HomePage },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'preferences',
    loadComponent: () =>
      import('./features/auth/preferences/preferences').then((m) => m.Preferences),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email').then((m) => m.VerifyEmail),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'content/:tipo/:id',
    loadComponent: () => import('./features/content/content-detail').then((m) => m.ContentDetail),
  },

  // Rutas protegidas
  { path: 'search', canActivate: [authGuard], component: SearchPage },
  { path: 'profile', canActivate: [authGuard], component: ProfilePage },
  { path: 'lists', canActivate: [authGuard], component: ListsPage },
  {
    path: 'lists/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/lists/list-detail/list-detail').then((m) => m.ListDetail),
  },
  { path: 'recommendations', canActivate: [authGuard], component: RecommendationsPage },
  {
    path: 'review/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/review/new-review/new-review').then((m) => m.NewReview),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/verify-email/verify-email').then((m) => m.VerifyEmail),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
