import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
  selector: 'app-new-review',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-review.html',
  styleUrl: './new-review.css',
})
export class NewReview {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private http   = inject(HttpClient);

  private readonly API_URL = '/api';

  // Params que vienen desde el detalle
  tipo: string = '';
  externalId: string = '';

  stars = [1, 2, 3, 4, 5];
  selectedStars = 0;
  hoveredStars  = 0;

  form = this.fb.group({
    puntuacion: [0,  Validators.min(1)],
    comentario: ['', Validators.required],
  });

  loading = false;
  error   = '';
  success = false;

  constructor() {
    this.tipo       = this.route.snapshot.queryParamMap.get('tipo') ?? '';
    this.externalId = this.route.snapshot.queryParamMap.get('id')   ?? '';
  }

  private postParsed(formData: FormData) {
    return this.http.post(this.API_URL, formData, { responseType: 'text' }).pipe(
      map((text: string) => {
        const cleaned = (text ?? '').replace(/^\uFEFF/, '').trim();
        const first = cleaned.indexOf('{');
        const last  = cleaned.lastIndexOf('}');
        if (first === -1 || last === -1 || last <= first) {
          throw new Error('Respuesta sin JSON válido.');
        }
        return JSON.parse(cleaned.slice(first, last + 1));
      })
    );
  }

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

    if (!this.externalId || !this.tipo) {
      this.error = 'No se ha especificado el contenido a reseñar';
      return;
    }

    this.loading = true;
    this.error   = '';

    const fd = new FormData();
    fd.append('action',      'crearResena');
    fd.append('external_id', this.externalId);
    fd.append('tipo',        this.tipo);
    fd.append('puntuacion',  String(this.selectedStars));
    fd.append('comentario',  this.form.value.comentario!);

    this.postParsed(fd).subscribe({
      next: res => {
        if (res.success) {
          this.success = true;
          setTimeout(() => this.router.navigate(['/profile']), 1500);
        } else {
          this.error   = res.message ?? 'Error al publicar la reseña';
          this.loading = false;
        }
      },
      error: () => {
        this.error   = 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  get comentario() { return this.form.get('comentario')!; }
}