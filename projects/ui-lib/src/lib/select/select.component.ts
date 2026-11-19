import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';
import { SelectOption } from './select.types';

let nextSelectId = 0;

/**
 * Select nativo estilizado con label, placeholder, estados de carga,
 * deshabilitado y error.
 *
 * Usa un `<select>` nativo a propósito: es accesible por teclado y lector de
 * pantalla sin trabajo extra y en móvil abre el selector del sistema.
 *
 * Es genérico en `V`: si las opciones son `SelectOption<'a' | 'b'>`, el
 * `value` y `selectionChange` quedan tipados con esa misma unión.
 *
 * @example
 * <ui-select label="Recurso" placeholder="Elige uno"
 *            [options]="options" [(value)]="selected"
 *            (selectionChange)="onChange($event)" />
 */
@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class SelectComponent<V extends string = string> {
  /** Lista de opciones `{ label, value }`. */
  readonly options = input<readonly SelectOption<V>[]>([]);

  /** Etiqueta visible sobre el select. */
  readonly label = input<string>('');

  /** Texto que se muestra mientras no hay selección (`value === null`). */
  readonly placeholder = input<string>('Selecciona una opción');

  /** Muestra un skeleton con spinner en lugar del select. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Bloquea la interacción. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Texto de ayuda bajo el select. */
  readonly hint = input<string | null>(null);

  /** Mensaje de error. Si no es `null`, el select se pinta en estado de error. */
  readonly error = input<string | null>(null);

  /** Two-way binding del valor seleccionado: `[(value)]="miSignal"`. */
  readonly value = model<V | null>(null);

  /** Emite la opción completa (`{ label, value }`) cada vez que el usuario cambia la selección. */
  readonly selectionChange = output<SelectOption<V>>();

  /** Id único para enlazar `<label for>` y `aria-describedby`. */
  protected readonly id = `ui-select-${nextSelectId++}`;

  /** Id del texto de ayuda o error, o `null` si no hay ninguno. */
  protected readonly describedBy = computed(() =>
    this.error() || this.hint() ? `${this.id}-description` : null,
  );

  /** Clases del `<select>` según su estado. */
  protected readonly selectClasses = computed(() => {
    const base =
      'h-11 w-full appearance-none rounded-lg border bg-ui-surface-muted pl-3 pr-10 text-sm text-ui-text ' +
      'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0';
    const tone = this.error()
      ? 'border-ui-danger focus-visible:ring-ui-danger/60'
      : 'border-ui-border focus-visible:border-ui-focus focus-visible:ring-ui-focus/50';
    const state = this.disabled()
      ? 'cursor-not-allowed opacity-50'
      : 'cursor-pointer hover:border-ui-primary/70';
    const placeholderTone = this.value() === null ? 'text-ui-text-muted' : '';
    return `${base} ${tone} ${state} ${placeholderTone}`;
  });

  /**
   * Maneja el evento `change` del `<select>` nativo: actualiza el `model()`
   * y emite la opción completa.
   */
  protected onNativeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const option = this.options().find((o) => o.value === target.value);
    if (!option) return;
    this.value.set(option.value);
    this.selectionChange.emit(option);
  }
}
