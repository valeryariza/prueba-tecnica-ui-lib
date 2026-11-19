/** Un campo del detalle: etiqueta + valor ya formateado. */
export interface DetailField {
  readonly label: string;
  readonly value: string;
  /** Muestra el valor en fuente monoespaciada (URLs, ids). */
  readonly mono?: boolean;
}

/** Extrae el id numérico final de una URL de la API (".../episode/28" → 28). */
export function idFromUrl(url: string): number | null {
  const last = url.split('/').pop() ?? '';
  return /^\d+$/.test(last) ? Number(last) : null;
}

/** Convierte una lista de URLs en un texto con sus ids. */
export function idsFromUrls(urls: readonly string[]): string {
  if (urls.length === 0) return '—';
  return urls
    .map(idFromUrl)
    .filter((id): id is number => id !== null)
    .map((id) => `#${id}`)
    .join(', ');
}

/** Formatea una fecha ISO en español. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Muestra "—" cuando la API devuelve un string vacío. */
export function orDash(value: string): string {
  return value.trim() === '' ? '—' : value;
}
