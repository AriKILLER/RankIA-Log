import { Component } from '@angular/core';

type ListTab = 'viendo' | 'pendientes' | 'completadas';

@Component({
  selector: 'app-lists-page',
  standalone: true,
  imports: [],
  templateUrl: './lists-page.html',
  styleUrl: './lists-page.css',
})
export class ListsPage {
  tabs: { key: ListTab; label: string }[] = [
    { key: 'viendo',       label: '👀 Viendo' },
    { key: 'pendientes',   label: '⏳ Pendientes' },
    { key: 'completadas',  label: '✅ Completadas' },
  ];

  activeTab: ListTab = 'viendo';

  // demo: items por lista (maquetación)
  items: Record<ListTab, { title: string; year?: string; rating?: string }[]> = {
    viendo: [
      { title: 'The Witcher', year: '2019' },
      { title: 'One Piece', year: '1999' },
    ],
    pendientes: [
      { title: 'Interstellar', year: '2014' },
      { title: 'Dune', year: '2021' },
      { title: 'Berserk', year: '1989' },
    ],
    completadas: [
      { title: 'Breaking Bad', year: '2008', rating: '★★★★★' },
      { title: 'Attack on Titan', year: '2013', rating: '★★★★★' },
      { title: 'Harry Potter', year: '1997', rating: '★★★★☆' },
    ],
  };

  setTab(tab: ListTab): void {
    this.activeTab = tab;
  }

  get currentItems() {
    return this.items[this.activeTab];
  }
}