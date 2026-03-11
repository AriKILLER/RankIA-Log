import { Routes } from '@angular/router';

import { HomePage } from './features/home/home-page/home-page';
import { SearchPage } from './features/search/search-page/search-page'
import { ProfilePage } from './features/profile/profile-page/profile-page';
import { ListsPage } from './features/lists/lists-page/lists-page';
import { RecommendationsPage } from './features/recommendations/recommendations-page/recommendations-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'search', component: SearchPage },
  { path: 'profile', component: ProfilePage },
  { path: 'lists', component: ListsPage },
  { path: 'recommendations', component: RecommendationsPage },
];
