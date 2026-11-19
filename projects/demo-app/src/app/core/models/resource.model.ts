import { Character } from './character.model';
import { Episode } from './episode.model';
import { Location } from './location.model';

/** Recursos que el explorador puede consultar (coinciden con el path del endpoint). */
export type ResourceType = 'character' | 'episode' | 'location';

/** Relaciona cada recurso con la interfaz de sus registros. */
export interface ResourceMap {
  character: Character;
  episode: Episode;
  location: Location;
}

/** Valores del filtro de status tal como los espera la API en el query param. */
export type StatusFilter = 'alive' | 'dead' | 'unknown';

/**
 * Registros cargados, como unión discriminada por `type`.
 * Así `items` siempre tiene el tipo correcto para el recurso:
 * si `type === 'episode'`, TypeScript sabe que `items` es `Episode[]`.
 */
export type ResourceRecords = {
  [K in ResourceType]: { readonly type: K; readonly items: ResourceMap[K][] };
}[ResourceType];

/** Un único registro junto con su tipo (para el modal de detalle y la eliminación). */
export type ResourceSelection = {
  [K in ResourceType]: { readonly type: K; readonly item: ResourceMap[K] };
}[ResourceType];

/** Parámetros de una petición al explorador. */
export interface ResourceQuery {
  readonly resource: ResourceType;
  readonly status: StatusFilter | null;
  readonly page: number;
}
