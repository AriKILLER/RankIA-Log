import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContenidoService } from '../../../core/services/contenido';
import { PreferenciaResponse, Genero } from '../models/models';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './preferences.html',
  styleUrl: './preferences.css',
})
export class Preferences {
  private fb = inject(FormBuilder);
  private contenido = inject(ContenidoService);
  private router = inject(Router);

  generos: Genero[] = [
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
    tipo_preferido: ['', Validators.required],
    duracion_preferida: ['', Validators.required],
    max_temporadas: ['', Validators.required],
    preferencia_popularidad: ['', Validators.required],
  });

  loading = false;
  error = '';

  toggleGenero(id: number): void {
    if (this.selectedGeneros.has(id)) this.selectedGeneros.delete(id);
    else this.selectedGeneros.add(id);
  }

  isGeneroSelected(id: number): boolean {
    return this.selectedGeneros.has(id);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.selectedGeneros.size === 0) {
      this.error = 'Selecciona al menos un género';
      return;
    }

    this.loading = true;
    this.error = '';

    const fd = new FormData();
    fd.append('action', 'crearPreferenciaUsuario');
    fd.append('tipo_preferido', this.form.value.tipo_preferido!);
    fd.append('duracion_preferida', this.form.value.duracion_preferida!);
    fd.append('max_temporadas', this.form.value.max_temporadas!);
    fd.append('preferencia_popularidad', this.form.value.preferencia_popularidad!);
    fd.append('generos_ids', JSON.stringify(Array.from(this.selectedGeneros)));

    this.contenido.postParsed(fd).subscribe({
      next: (res: PreferenciaResponse) => {
        if (res.success) {
          this.router.navigate(['']);
        } else {
          this.error = res.message ?? 'Error al guardar preferencias';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Error al conectar con el servidor';
        this.loading = false;
      },
    });
  }

  get tipo_preferido() {
    return this.form.get('tipo_preferido')!;
  }
  get duracion_preferida() {
    return this.form.get('duracion_preferida')!;
  }
  get max_temporadas() {
    return this.form.get('max_temporadas')!;
  }
  get preferencia_popularidad() {
    return this.form.get('preferencia_popularidad')!;
  }
}
