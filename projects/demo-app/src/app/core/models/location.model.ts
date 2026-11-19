/**
 * Ubicación — `GET /location`.
 *
 * Nota: el nombre coincide con el tipo global `Location` del DOM
 * (window.location). Siempre se importa explícitamente desde este archivo.
 */
export interface Location {
  readonly id: number;
  readonly name: string;
  readonly type: string;
  readonly dimension: string;
  /** URLs de los personajes que viven aquí. */
  readonly residents: string[];
  readonly url: string;
  readonly created: string;
}
