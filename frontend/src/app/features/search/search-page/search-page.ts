import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-page.html',
  styleUrl: './search-page.css',
})
export class SearchPage {
  query = '';

  // demo: filtros visuales (no conectamos aún)
  contentTypes = [
    { key: 'pelicula', label: '🎬 Películas' },
    { key: 'serie', label: '📺 Series' },
    { key: 'anime', label: '⛩️ Anime' },
    { key: 'manga', label: '📚 Manga' },
    { key: 'libro', label: '📖 Libros' },
  ];

  selectedType: string = 'pelicula';

  // demo: resultados fake para maquetación
  results = [
    { title: 'Dune', year: '2021', rating: '★★★★☆' },
    { title: 'Breaking Bad', year: '2008', rating: '★★★★★' },
    { title: 'Attack on Titan', year: '2013', rating: '★★★★★' },
    { title: 'Interstellar', year: '2014', rating: '★★★★★' },
    { title: 'The Witcher', year: '2019', rating: '★★★★☆' },
    { title: 'Harry Potter', year: '1997', rating: '★★★★☆' },
  ];

  onSearch(): void {
    // demo: por ahora no filtra, solo evita submit vacío
    this.query = this.query.trim();
  }

  selectType(type: string): void {
    this.selectedType = type;
  }
}