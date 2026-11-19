/** Metadatos de paginación que devuelve la Rick and Morty API. */
export interface ApiInfo {
  readonly count: number;
  readonly pages: number;
  readonly next: string | null;
  readonly prev: string | null;
}

/** Respuesta paginada genérica de la API. */
export interface ApiPage<T> {
  readonly info: ApiInfo;
  readonly results: T[];
}

/** Referencia a otro recurso (p. ej. origen o ubicación de un personaje). */
export interface ResourceRef {
  readonly name: string;
  readonly url: string;
}
