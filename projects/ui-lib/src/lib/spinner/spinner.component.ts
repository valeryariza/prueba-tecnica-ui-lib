import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Tamaños disponibles para el spinner. */
export type SpinnerSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
};

/**
 * Indicador de carga circular. Hereda el color del texto (`currentColor`),
 * así que funciona dentro de cualquier variante de botón o contenedor.
 *
 * @example
 * <ui-spinner size="md" label="Cargando personajes" />
 */
@Component({
  selector: 'ui-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0' },
  template: `
    <svg
      [class]="sizeClass()"
      class="animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      [attr.role]="decorative() ? null : 'status'"
      [attr.aria-label]="decorative() ? null : label()"
      [attr.aria-hidden]="decorative() ? 'true' : null"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  `,
})
export class SpinnerComponent {
  /** Tamaño visual del spinner. */
  readonly size = input<SpinnerSize>('md');

  /** Texto accesible que anuncian los lectores de pantalla. */
  readonly label = input<string>('Cargando');

  /**
   * Si es `true`, el spinner se oculta a los lectores de pantalla
   * (útil cuando el contenedor ya comunica el estado, p. ej. `aria-busy`).
   */
  readonly decorative = input<boolean>(false);

  /** Clases de tamaño derivadas del input `size`. */
  protected readonly sizeClass = computed(() => SIZE_CLASSES[this.size()]);
}
