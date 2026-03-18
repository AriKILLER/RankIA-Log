import { Component } from '@angular/core';

@Component({
  selector: 'app-recommendations-page',
  standalone: true,
  imports: [],
  templateUrl: './recommendations-page.html',
  styleUrl: './recommendations-page.css',
})
export class RecommendationsPage {
  // demo: “reglas” que explicarían por qué se recomienda algo
  rules = [
    { title: 'Tipo preferido', value: 'Películas', icon: '🎬' },
    { title: 'Duración', value: 'Media', icon: '⏱️' },
    { title: 'Popularidad', value: 'Popular', icon: '🔥' },
  ];

  // demo: recomendaciones fake (para maquetación)
  recommendations = [
    { title: 'Interstellar', year: '2014', reason: 'Sci-fi popular con alta valoración', rating: '★★★★★' },
    { title: 'Dune', year: '2021', reason: 'Épica moderna, similar a tus gustos', rating: '★★★★☆' },
    { title: 'Breaking Bad', year: '2008', reason: 'Top series por comunidad', rating: '★★★★★' },
    { title: 'Attack on Titan', year: '2013', reason: 'Anime muy recomendado', rating: '★★★★★' },
    { title: 'The Witcher', year: '2019', reason: 'Fantasía popular', rating: '★★★★☆' },
    { title: 'Harry Potter', year: '1997', reason: 'Clásico muy valorado', rating: '★★★★☆' },
  ];

  refresh(): void {
    // demo: aquí iría la lógica real (backend/reglas)
  }
}