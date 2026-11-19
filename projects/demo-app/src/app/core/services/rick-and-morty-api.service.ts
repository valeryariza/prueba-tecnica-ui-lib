import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { ApiPage, ResourceMap, ResourceType, StatusFilter } from '../models';

/** URL base de la API. Se inyecta como token para poder cambiarla en tests. */
export const RICK_AND_MORTY_API_URL = new InjectionToken<string>('RICK_AND_MORTY_API_URL', {
  providedIn: 'root',
  factory: () => 'https://rickandmortyapi.com/api',
});

/** Página vacía, usada cuando la API responde 404 a un filtro sin resultados. */
function emptyPage<T>(): ApiPage<T> {
  return { info: { count: 0, pages: 0, next: null, prev: null }, results: [] };
}

/**
 * Acceso HTTP a la Rick and Morty API. Es la única pieza de la app que usa
 * `HttpClient`; los componentes nunca llaman a la API directamente.
 */
@Injectable({ providedIn: 'root' })
export class RickAndMortyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(RICK_AND_MORTY_API_URL);

  /**
   * Pide una página de un recurso.
   *
   * - El filtro `status` solo existe en `/character`; para los demás recursos se ignora.
   * - La API responde **404** cuando un filtro no tiene resultados. Eso no es un
   *   error de red, así que se transforma en una página vacía.
   *
   * @param resource Recurso a consultar.
   * @param page Página (empieza en 1).
   * @param status Filtro de status opcional.
   */
  getPage<K extends ResourceType>(
    resource: K,
    page: number,
    status: StatusFilter | null,
  ): Observable<ApiPage<ResourceMap[K]>> {
    let params = new HttpParams().set('page', page);
    if (status && resource === 'character') {
      params = params.set('status', status);
    }

    return this.http.get<ApiPage<ResourceMap[K]>>(`${this.baseUrl}/${resource}`, { params }).pipe(
      catchError((error: unknown) =>
        error instanceof HttpErrorResponse && error.status === 404
          ? of(emptyPage<ResourceMap[K]>())
          : throwError(() => error),
      ),
    );
  }
}
