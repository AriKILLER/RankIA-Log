import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class LoadingComponent {
  @Input() mensaje: string = 'Cargando...';
}