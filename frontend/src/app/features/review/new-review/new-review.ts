import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-review',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-review.html',
  styleUrl: './new-review.css',
})
export class NewReview {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  stars = [1, 2, 3, 4, 5];
  selectedStars = 0;
  hoveredStars = 0;

  form = this.fb.group({
    titulo: ['', Validators.required],
    puntuacion: [0, Validators.min(1)],
    comentario: ['', Validators.required],
  });

  loading = false;
  error = '';

  setStars(n: number): void {
    this.selectedStars = n;
    this.form.patchValue({ puntuacion: n });
  }

  hoverStars(n: number): void {
    this.hoveredStars = n;
  }

  resetHover(): void {
    this.hoveredStars = 0;
  }

  onSubmit(): void {
    if (this.form.invalid || this.selectedStars === 0) {
      this.error = 'Completa todos los campos y selecciona una puntuación';
      return;
    }
    // Por ahora solo redirige, se conectará al backend más adelante
    this.router.navigate(['/profile']);
  }

  get titulo() {
    return this.form.get('titulo')!;
  }
  get comentario() {
    return this.form.get('comentario')!;
  }
}
