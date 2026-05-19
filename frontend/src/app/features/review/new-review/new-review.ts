import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContenidoService, CatalogoItemUI } from '../../../core/services/contenido';
import { ListaService } from '../../../core/services/lista';
import { DetalleResponse, RawDetalle, CrearResenaResponse } from '../../auth/models/models';

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
  private contenido = inject(ContenidoService);

  tipo: string = '';
  externalId: string = '';

  titulo: string = '';
  posterUrl: string | null = null;
  loadingDetalle = false;

  busqueda: string = '';
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
      next: (res: DetalleResponse) => {
        const d = res?.detalle ?? (res as RawDetalle);
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
      next: (items: CatalogoItemUI[]) => {
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

    const fd = new FormData();
    fd.append('action', 'crearResena');
    fd.append('external_id', String(this.externalId));
    fd.append('tipo', this.tipo);
    fd.append('puntuacion', String(this.selectedStars));
    fd.append('comentario', this.form.value.comentario!);

    this.contenido.postParsed(fd).subscribe({
      next: (res: CrearResenaResponse) => {
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
  }

  get comentario() {
    return this.form.get('comentario')!;
  }
}
