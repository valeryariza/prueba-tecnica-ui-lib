/** Episodio — `GET /episode`. */
export interface Episode {
  readonly id: number;
  readonly name: string;
  /** Fecha de emisión en texto, p. ej. "December 2, 2013". */
  readonly air_date: string;
  /** Código del episodio, p. ej. "S01E01". */
  readonly episode: string;
  /** URLs de los personajes que aparecen. */
  readonly characters: string[];
  readonly url: string;
  readonly created: string;
}
