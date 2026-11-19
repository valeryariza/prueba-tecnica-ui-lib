/**
 * Definición de una columna de `ui-table`.
 *
 * @typeParam T Tipo de cada fila. `key` solo acepta propiedades reales de `T`,
 * así un error de escritura en una columna falla en compilación.
 */
export interface TableColumn<T> {
  /** Propiedad de la fila que se muestra en la columna. */
  readonly key: Extract<keyof T, string>;
  /** Texto del encabezado. */
  readonly header: string;
  /**
   * Función opcional para formatear la celda (p. ej. objetos anidados o arrays).
   * Si no se define, la tabla muestra el valor si es primitivo.
   */
  readonly cell?: (row: T) => string;
  /** Alineación del contenido. Por defecto `left`. */
  readonly align?: 'left' | 'center' | 'right';
}

/** Acciones que la tabla puede emitir por fila. */
export type TableActionType = 'view' | 'delete';

/**
 * Evento emitido por `actionTriggered`. La tabla no interpreta la acción:
 * el componente padre decide qué hacer con ella.
 */
export interface TableAction<T> {
  readonly action: TableActionType;
  readonly row: T;
}
