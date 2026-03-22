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

  contentTypes = [
    { key: 'pelicula', label: '🎬 Películas' },
    { key: 'serie', label: '📺 Series' },
  ];

  selectedType: string = 'pelicula';

  results = [
    { title: 'Dune', year: '2021', rating: '★★★★☆' },
    { title: 'Interstellar', year: '2014', rating: '★★★★★' },
    { title: 'Breaking Bad', year: '2008', rating: '★★★★★' },
    { title: 'The Witcher', year: '2019', rating: '★★★★☆' },
    { title: 'Oppenheimer', year: '2023', rating: '★★★★★' },
    { title: 'Stranger Things', year: '2016', rating: '★★★★☆' },
  ];

  onSearch(): void {
    this.query = this.query.trim();
  }

  selectType(type: string): void {
    this.selectedType = type;
  }
}
