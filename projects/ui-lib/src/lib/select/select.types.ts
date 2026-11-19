/**
 * Opción de un `ui-select`.
 *
 * @typeParam V Tipo del valor. Por defecto `string`; se puede estrechar a una
 * unión literal (p. ej. `'alive' | 'dead'`) para tener valores tipados.
 */
export interface SelectOption<V extends string = string> {
  /** Texto visible de la opción. */
  readonly label: string;
  /** Valor que se guarda en el `model()` `value`. */
  readonly value: V;
  /** Deshabilita esta opción concreta. */
  readonly disabled?: boolean;
}
