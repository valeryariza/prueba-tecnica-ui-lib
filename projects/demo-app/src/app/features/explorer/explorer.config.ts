import { SelectOption, TableColumn } from 'ui-lib';
import { Character, Episode, Location, ResourceType, StatusFilter } from '../../core/models';

/** Opciones del select de recurso. */
export const RESOURCE_OPTIONS: readonly SelectOption<ResourceType>[] = [
  { label: 'Characters', value: 'character' },
  { label: 'Episodes', value: 'episode' },
  { label: 'Locations', value: 'location' },
];

/** Opciones fijas del filtro de status. */
export const STATUS_OPTIONS: readonly SelectOption<StatusFilter>[] = [
  { label: 'Alive', value: 'alive' },
  { label: 'Dead', value: 'dead' },
  { label: 'Unknown', value: 'unknown' },
];

/** Nombre en español de cada recurso (singular / plural) para textos de la UI. */
export const RESOURCE_LABELS: Record<ResourceType, { readonly one: string; readonly many: string }> = {
  character: { one: 'personaje', many: 'personajes' },
  episode: { one: 'episodio', many: 'episodios' },
  location: { one: 'ubicación', many: 'ubicaciones' },
};

/** Columnas de la tabla de personajes. */
export const CHARACTER_COLUMNS: readonly TableColumn<Character>[] = [
  { key: 'name', header: 'Nombre' },
  { key: 'status', header: 'Status' },
  { key: 'species', header: 'Especie' },
  { key: 'gender', header: 'Género' },
  { key: 'origin', header: 'Origen', cell: (c) => c.origin.name },
  { key: 'episode', header: 'Episodios', cell: (c) => String(c.episode.length), align: 'right' },
];

/** Columnas de la tabla de episodios. */
export const EPISODE_COLUMNS: readonly TableColumn<Episode>[] = [
  { key: 'episode', header: 'Código' },
  { key: 'name', header: 'Nombre' },
  { key: 'air_date', header: 'Emisión' },
  { key: 'characters', header: 'Personajes', cell: (e) => String(e.characters.length), align: 'right' },
];

/** Columnas de la tabla de ubicaciones. */
export const LOCATION_COLUMNS: readonly TableColumn<Location>[] = [
  { key: 'name', header: 'Nombre' },
  { key: 'type', header: 'Tipo' },
  { key: 'dimension', header: 'Dimensión' },
  { key: 'residents', header: 'Residentes', cell: (l) => String(l.residents.length), align: 'right' },
];
