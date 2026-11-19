import { HttpErrorResponse } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, Subject, switchMap } from 'rxjs';
import {
  ApiInfo,
  ResourceQuery,
  ResourceRecords,
  ResourceType,
  StatusFilter,
} from '../models';
import { RickAndMortyApiService } from '../services/rick-and-morty-api.service';

/** Datos de una petición exitosa. */
interface LoadedPage {
  readonly info: ApiInfo;
  readonly records: ResourceRecords;
}

/** Resultado de una petición, ya convertido a algo que el estado entiende. */
type LoadResult =
  | { readonly ok: true; readonly info: ApiInfo; readonly records: ResourceRecords }
  | { readonly ok: false; readonly message: string };

/** Devuelve una colección vacía del recurso indicado. */
function emptyRecords(type: ResourceType): ResourceRecords {
  switch (type) {
    case 'character':
      return { type, items: [] };
    case 'episode':
      return { type, items: [] };
    case 'location':
      return { type, items: [] };
  }
}

/** Quita un elemento por `id` conservando el tipo concreto del array. */
function withoutId<T extends { readonly id: number }>(items: T[], id: number): T[] {
  return items.filter((item) => item.id !== id);
}

/** Traduce un error HTTP a un mensaje claro para el usuario. */
function toErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No pudimos abrir el portal: no hay conexión con la Rick and Morty API. Revisa tu internet e inténtalo de nuevo.';
    }
    return `La API respondió con un error (${error.status}). Inténtalo de nuevo en unos segundos.`;
  }
  return 'Ocurrió un error inesperado al cargar los datos.';
}

/**
 * Estado del explorador de recursos, manejado con signals.
 *
 * Es la única fuente de verdad de: recurso activo, filtro, página, registros,
 * loading y error. Los componentes leen los signals de solo lectura y llaman
 * a los métodos públicos; nunca modifican el estado ni hacen HTTP directamente.
 *
 * Las peticiones pasan por un `Subject` + `switchMap`: si el usuario cambia de
 * recurso o filtro antes de que llegue la respuesta anterior, esa petición se
 * cancela y no puede pisar los datos nuevos (evita condiciones de carrera).
 */
@Injectable({ providedIn: 'root' })
export class ExplorerStore {
  private readonly api = inject(RickAndMortyApiService);

  // --- Estado privado (escribible solo desde el store) ---
  private readonly _resource = signal<ResourceType>('character');
  private readonly _status = signal<StatusFilter | null>(null);
  private readonly _page = signal(1);
  private readonly _records = signal<ResourceRecords>(emptyRecords('character'));
  private readonly _info = signal<ApiInfo | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // --- Estado público de solo lectura ---
  /** Recurso activo. */
  readonly resource = this._resource.asReadonly();
  /** Filtro de status activo (`null` = sin filtro). */
  readonly status = this._status.asReadonly();
  /** Página actual. */
  readonly page = this._page.asReadonly();
  /** Registros cargados, discriminados por tipo de recurso. */
  readonly records = this._records.asReadonly();
  /** `true` mientras hay una petición en curso. */
  readonly loading = this._loading.asReadonly();
  /** Mensaje de error de la última petición, o `null`. */
  readonly error = this._error.asReadonly();

  // --- Derivados ---
  /** El filtro de status solo aplica a personajes (la API no lo soporta en otros recursos). */
  readonly statusFilterEnabled = computed(() => this._resource() === 'character');
  /** Total de registros del recurso (con el filtro aplicado). */
  readonly totalCount = computed(() => this._info()?.count ?? 0);
  /** Total de páginas. */
  readonly totalPages = computed(() => this._info()?.pages ?? 0);
  /** Hay página siguiente. */
  readonly hasNextPage = computed(() => this._info()?.next != null);
  /** Hay página anterior. */
  readonly hasPrevPage = computed(() => this._info()?.prev != null);

  private readonly requests$ = new Subject<ResourceQuery>();

  constructor() {
    this.requests$
      .pipe(
        switchMap((query) => this.fetch(query)),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((result) => {
        if (result.ok) {
          this._records.set(result.records);
          this._info.set(result.info);
        } else {
          this._info.set(null);
          this._error.set(result.message);
        }
        this._loading.set(false);
      });
  }

  /** Carga (o recarga) los datos con el estado actual. */
  load(): void {
    this._loading.set(true);
    this._error.set(null);
    this.requests$.next({ resource: this._resource(), status: this._status(), page: this._page() });
  }

  /**
   * Cambia el recurso activo. Reinicia el filtro y la página y vacía los
   * registros para que la tabla muestre las columnas del nuevo recurso.
   */
  setResource(resource: ResourceType): void {
    if (resource === this._resource()) return;
    this._resource.set(resource);
    this._status.set(null);
    this._page.set(1);
    this._records.set(emptyRecords(resource));
    this._info.set(null);
    this.load();
  }

  /** Aplica un filtro de status (solo personajes) y vuelve a la página 1. */
  setStatus(status: StatusFilter | null): void {
    if (!this.statusFilterEnabled() || status === this._status()) return;
    this._status.set(status);
    this._page.set(1);
    this.load();
  }

  /** Va a la página siguiente, si existe. */
  nextPage(): void {
    if (!this.hasNextPage() || this._loading()) return;
    this._page.update((p) => p + 1);
    this.load();
  }

  /** Va a la página anterior, si existe. */
  prevPage(): void {
    if (!this.hasPrevPage() || this._loading()) return;
    this._page.update((p) => p - 1);
    this.load();
  }

  /**
   * Elimina un registro del estado local (la API es de solo lectura,
   * así que el cambio no se persiste y vuelve a aparecer al recargar).
   */
  removeRecord(type: ResourceType, id: number): void {
    const current = this._records();
    if (current.type !== type) return;

    switch (current.type) {
      case 'character':
        this._records.set({ type: current.type, items: withoutId(current.items, id) });
        break;
      case 'episode':
        this._records.set({ type: current.type, items: withoutId(current.items, id) });
        break;
      case 'location':
        this._records.set({ type: current.type, items: withoutId(current.items, id) });
        break;
    }
    this._info.update((info) => (info ? { ...info, count: Math.max(0, info.count - 1) } : info));
  }

  /**
   * Ejecuta la petición y la convierte en `LoadResult`. El `catchError` va
   * dentro del `switchMap` para que un error no cierre el stream principal.
   */
  private fetch(query: ResourceQuery): Observable<LoadResult> {
    const { page, status } = query;
    let request$: Observable<LoadedPage>;

    switch (query.resource) {
      case 'character':
        request$ = this.api
          .getPage('character', page, status)
          .pipe(map((res): LoadedPage => ({ info: res.info, records: { type: 'character', items: res.results } })));
        break;
      case 'episode':
        request$ = this.api
          .getPage('episode', page, null)
          .pipe(map((res): LoadedPage => ({ info: res.info, records: { type: 'episode', items: res.results } })));
        break;
      case 'location':
        request$ = this.api
          .getPage('location', page, null)
          .pipe(map((res): LoadedPage => ({ info: res.info, records: { type: 'location', items: res.results } })));
        break;
    }

    return request$.pipe(
      map((data): LoadResult => ({ ok: true, ...data })),
      catchError((error: unknown) => of<LoadResult>({ ok: false, message: toErrorMessage(error) })),
    );
  }
}
