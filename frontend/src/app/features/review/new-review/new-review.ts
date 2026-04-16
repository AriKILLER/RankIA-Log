import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { ContenidoService, CatalogoItemUI } from '../../../core/services/contenido';

@Component({
  selector: 'app-new-review',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './new-review.html',
  styleUrl: './new-review.css',
})
export class NewReview {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private contenido = inject(ContenidoService);

  private readonly API_URL = '/api';

  tipo: string = '';
  externalId: string = '';

  titulo: string = '';
  posterUrl: string | null = null;
  loadingDetalle = false;

  // Búsqueda
  busqueda = '';
  resultadosBusqueda: CatalogoItemUI[] = [];
  loadingBusqueda = false;

  stars = [1, 2, 3, 4, 5];
  selectedStars = 0;
  hoveredStars = 0;

  form = this.fb.group({
    puntuacion: [0, Validators.min(1)],
    comentario: ['', Validators.required],
  });

  loading = false;
  error = '';
  success = false;

  constructor() {
    this.tipo = this.route.snapshot.queryParamMap.get('tipo') ?? '';
    this.externalId = this.route.snapshot.queryParamMap.get('id') ?? '';

    if (this.externalId && this.tipo) {
      this.cargarDetalle();
    }
  }

  private cargarDetalle(): void {
    this.loadingDetalle = true;

    const fd = new FormData();
    fd.append('action', 'obtenerDetalleTmdb');
    fd.append('tmdbId', this.externalId);
    fd.append('tipo', this.tipo);

    this.contenido.postParsed(fd).subscribe({
      next: (res: any) => {
        const d = res?.contenido ?? res?.detalle ?? res;
        this.titulo = d?.titulo ?? d?.title ?? d?.name ?? '';
        this.posterUrl = this.contenido.toPosterUrl(d?.poster ?? d?.poster_path ?? null);
        this.loadingDetalle = false;
      },
      error: () => {
        this.loadingDetalle = false;
      },
    });
  }

  buscar(): void {
    const q = this.busqueda.trim();
    if (!q) return;

    this.loadingBusqueda = true;
    this.resultadosBusqueda = [];

    this.contenido.buscarContenidoTmdb(q).subscribe({
      next: (items) => {
        this.resultadosBusqueda = items.slice(0, 8);
        this.loadingBusqueda = false;
      },
      error: () => {
        this.loadingBusqueda = false;
      },
    });
  }

  seleccionarContenido(item: CatalogoItemUI): void {
    this.externalId = String(item.externalId);
    this.tipo = item.tipo;
    this.titulo = item.titulo;
    this.posterUrl = item.posterUrl;
    this.resultadosBusqueda = [];
    this.busqueda = '';
  }

  limpiarSeleccion(): void {
    this.externalId = '';
    this.tipo = '';
    this.titulo = '';
    this.posterUrl = null;
    this.form.reset();
    this.selectedStars = 0;
    this.error = '';
  }

  private postParsed(formData: FormData) {
    return this.http.post(this.API_URL, formData, { responseType: 'text' }).pipe(
      map((text: string) => {
        const cleaned = (text ?? '').replace(/^\uFEFF/, '').trim();
        const first = cleaned.indexOf('{');
        const last = cleaned.lastIndexOf('}');
        if (first === -1 || last === -1 || last <= first) {
          throw new Error('Respuesta sin JSON válido.');
        }
        return JSON.parse(cleaned.slice(first, last + 1));
      }),
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
    this.error = '';

    // Primero guardamos el contenido en BD para obtener el contenido_id
    const fdGuardar = new FormData();
    fdGuardar.append('action', 'guardarDetalleEnBd');
    fdGuardar.append('external_id', this.externalId);
    fdGuardar.append('titulo', this.titulo);
    fdGuardar.append('tipo', this.tipo);
    fdGuardar.append('sinopsis', '');
    fdGuardar.append('poster', this.posterUrl ?? '');
    fdGuardar.append('fecha_lanzamiento', '');
    fdGuardar.append('duracion', '0');
    fdGuardar.append('numero_temporadas', '0');
    fdGuardar.append('popularidad', '0');

    this.postParsed(fdGuardar).subscribe({
      next: (resGuardar) => {
        const contenidoId = resGuardar?.contenido_id;
        if (!contenidoId) {
          this.error = 'Error al registrar el contenido';
          this.loading = false;
          return;
        }

        // Ahora creamos la reseña con el contenido_id real
        const fd = new FormData();
        fd.append('action', 'crearResena');
        fd.append('contenido_id', String(contenidoId));
        fd.append('puntuacion', String(this.selectedStars));
        fd.append('comentario', this.form.value.comentario!);

        this.postParsed(fd).subscribe({
          next: (res) => {
            if (res.success) {
              this.success = true;
              setTimeout(() => this.router.navigate(['/profile']), 1500);
            } else {
              this.error = res.message ?? 'Error al publicar la reseña';
              this.loading = false;
            }
          },
          error: () => {
            this.error = 'Error al conectar con el servidor';
            this.loading = false;
          },
        });
      },
      error: () => {
        this.error = 'Error al registrar el contenido';
        this.loading = false;
      },
    });
  }
  get comentario() {
    return this.form.get('comentario')!;
  }
}
