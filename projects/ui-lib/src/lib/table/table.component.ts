import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { TableAction, TableActionType, TableColumn } from './table.types';

/** Estado visual que la tabla está mostrando. */
type TableViewState = 'loading' | 'error' | 'empty' | 'data';

/**
 * Tabla genérica: no conoce el dominio de los datos. Solo renderiza las
 * columnas que recibe y emite acciones; el padre interpreta cada acción.
 *
 * Maneja cuatro estados, en este orden de prioridad:
 * `loading` (skeleton rows) → `error` → `empty` → datos.
 *
 * En pantallas pequeñas cada fila se muestra como una tarjeta apilada
 * en lugar de una tabla con scroll horizontal.
 *
 * Slots: `[uiTableEmpty]` permite proyectar una ilustración para el estado vacío.
 *
 * @typeParam T Tipo de cada fila. Se infiere de `rows` y `columns`.
 *
 * @example
 * <ui-table [columns]="columns" [rows]="characters()" [loading]="loading()"
 *           [errorMessage]="error()" emptyMessage="Sin resultados"
 *           (actionTriggered)="onAction($event)" />
 */
@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TableComponent<T extends object> {
  /** Definición de columnas `{ key, header }`. */
  readonly columns = input.required<readonly TableColumn<T>[]>();

  /** Datos a renderizar. */
  readonly rows = input<readonly T[]>([]);

  /** Muestra filas skeleton en lugar de los datos. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Mensaje mostrado cuando `rows` está vacío. */
  readonly emptyMessage = input<string>('No hay registros para mostrar.');

  /** Mensaje de error de red. Si no es `null`, la tabla muestra el estado de error. */
  readonly errorMessage = input<string | null>(null);

  /** Acciones disponibles en cada fila. Un array vacío oculta la columna de acciones. */
  readonly actions = input<readonly TableActionType[]>(['view', 'delete']);

  /** Texto del botón de la acción `view`. */
  readonly viewLabel = input<string>('Ver detalle');

  /** Texto del botón de la acción `delete`. */
  readonly deleteLabel = input<string>('Eliminar');

  /** Número de filas skeleton durante la carga. */
  readonly skeletonRows = input(6, { transform: numberAttribute });

  /** Descripción accesible de la tabla (se renderiza como `<caption>` oculto). */
  readonly caption = input<string | null>(null);

  /**
   * Función que devuelve una clave estable por fila para el `track` del `@for`.
   * Por defecto usa la propia referencia del objeto.
   */
  readonly trackBy = input<(row: T) => unknown>((row: T) => row);

  /** Texto del botón de reintento en el estado de error. Si es `null`, no se muestra. */
  readonly retryLabel = input<string | null>('Reintentar');

  /** Emite `{ action, row }` cuando el usuario pulsa una acción de fila. */
  readonly actionTriggered = output<TableAction<T>>();

  /** Emite cuando el usuario pulsa "Reintentar" en el estado de error. */
  readonly retryRequested = output<void>();

  /** Estado que se está mostrando. */
  protected readonly viewState = computed<TableViewState>(() => {
    if (this.loading()) return 'loading';
    if (this.errorMessage()) return 'error';
    if (this.rows().length === 0) return 'empty';
    return 'data';
  });

  /** Índices para pintar las filas skeleton. */
  protected readonly skeletonIndexes = computed(() =>
    Array.from({ length: Math.max(1, this.skeletonRows()) }, (_, i) => i),
  );

  /** Indica si se muestra la columna de acciones. */
  protected readonly hasActions = computed(() => this.actions().length > 0);

  /**
   * Devuelve el texto de una celda. Usa `column.cell` si existe; si no,
   * muestra el valor solo si es primitivo, para no imprimir `[object Object]`.
   */
  protected cellValue(row: T, column: TableColumn<T>): string {
    if (column.cell) return column.cell(row);
    const value: unknown = row[column.key];
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return '—';
  }

  /** Clase de alineación de una columna. */
  protected alignClass(column: TableColumn<T>): string {
    switch (column.align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  }

  /** Emite la acción de fila hacia el padre. */
  protected trigger(action: TableActionType, row: T): void {
    this.actionTriggered.emit({ action, row });
  }

  /** Indica si una acción concreta está habilitada. */
  protected hasAction(action: TableActionType): boolean {
    return this.actions().includes(action);
  }
}
