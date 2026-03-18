import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './preferences.html',
  styleUrl: './preferences.css',
})
export class Preferences {
  private fb     = inject(FormBuilder);
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = '/api';

  // Géneros según seed.sql (orden = IDs 1..10)
  generos = [
    { id: 1, nombre: 'Acción' },
    { id: 2, nombre: 'Drama' },
    { id: 3, nombre: 'Comedia' },
    { id: 4, nombre: 'Terror' },
    { id: 5, nombre: 'Thriller' },
    { id: 6, nombre: 'Ciencia ficción' },
    { id: 7, nombre: 'Fantasía' },
    { id: 8, nombre: 'Romance' },
    { id: 9, nombre: 'Animación' },
    { id: 10, nombre: 'Documental' },
  ];

  selectedGeneros = new Set<number>();

  form = this.fb.group({
    tipo_preferido:          ['', Validators.required],
    duracion_preferida:      ['', Validators.required],
    max_temporadas:          ['', Validators.required],
    preferencia_popularidad: ['', Validators.required],
  });

  loading = false;
  error   = '';

  toggleGenero(id: number): void {
    if (this.selectedGeneros.has(id)) this.selectedGeneros.delete(id);
    else this.selectedGeneros.add(id);
  }

  isGeneroSelected(id: number): boolean {
    return this.selectedGeneros.has(id);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    // Validación extra: mínimo 1 género
    if (this.selectedGeneros.size === 0) {
      this.error = 'Selecciona al menos un género';
      return;
    }

    this.loading = true;
    this.error   = '';

    const formData = new FormData();
    formData.append('action', 'crearPreferenciaUsuario');
    formData.append('tipo_preferido',          this.form.value.tipo_preferido!);
    formData.append('duracion_preferida',      this.form.value.duracion_preferida!);
    formData.append('max_temporadas',          this.form.value.max_temporadas!);
    formData.append('preferencia_popularidad', this.form.value.preferencia_popularidad!);

    // Backend espera generos_ids en JSON
    formData.append('generos_ids', JSON.stringify(Array.from(this.selectedGeneros)));

    this.http.post<any>(this.API_URL, formData).subscribe({
      next: res => {
        if (res.success) {
          this.router.navigate(['']);
        } else {
          this.error   = res.message;
          this.loading = false;
        }
      },
      error: () => {
        this.error   = 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  get tipo_preferido()          { return this.form.get('tipo_preferido')!; }
  get duracion_preferida()      { return this.form.get('duracion_preferida')!; }
  get max_temporadas()          { return this.form.get('max_temporadas')!; }
  get preferencia_popularidad() { return this.form.get('preferencia_popularidad')!; }
}