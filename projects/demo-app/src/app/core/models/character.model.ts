import { ResourceRef } from './api.model';

/** Valores de `status` que devuelve la API (ojo: `unknown` va en minúscula). */
export type CharacterStatus = 'Alive' | 'Dead' | 'unknown';

/** Valores de `gender` que devuelve la API. */
export type CharacterGender = 'Female' | 'Male' | 'Genderless' | 'unknown';

/** Personaje — `GET /character`. */
export interface Character {
  readonly id: number;
  readonly name: string;
  readonly status: CharacterStatus;
  readonly species: string;
  readonly type: string;
  readonly gender: CharacterGender;
  readonly origin: ResourceRef;
  readonly location: ResourceRef;
  readonly image: string;
  /** URLs de los episodios en los que aparece. */
  readonly episode: string[];
  readonly url: string;
  readonly created: string;
}
