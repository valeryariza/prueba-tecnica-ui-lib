import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';
import { ButtonSize, ButtonType, ButtonVariant } from './button.types';

const BASE_CLASSES =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold ' +
  'transition-[background-color,color,box-shadow,transform] duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus focus-visible:ring-offset-2 focus-visible:ring-offset-ui-surface';

/** Estilo por defecto de cada variante. */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-ui-primary text-ui-on-primary shadow-sm',
  secondary: 'border border-ui-secondary bg-transparent text-ui-secondary',
  danger: 'bg-ui-danger text-ui-on-danger shadow-sm',
};

/** Estilo hover/active: solo se aplica cuando el botón es interactivo. */
const INTERACTIVE_CLASSES: Record<ButtonVariant, string> = {
  primary: 'hover:bg-ui-primary-hover active:scale-[0.98]',
  secondary: 'hover:bg-ui-secondary/10 hover:text-ui-secondary-hover active:scale-[0.98]',
  danger: 'hover:bg-ui-danger-hover active:scale-[0.98]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

/**
 * Botón de acción con variantes, tamaños y estados `disabled` / `loading`.
 *
 * El output `clicked` solo se emite cuando el botón no está deshabilitado
 * ni cargando, así el componente padre no tiene que repetir esa validación.
 *
 * @example
 * <ui-button label="Guardar" variant="primary" size="md"
 *            [loading]="saving()" (clicked)="save()" />
 */
@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.inline-flex]': '!fullWidth()',
    '[class.flex]': 'fullWidth()',
    '[class.w-full]': 'fullWidth()',
  },
})
export class ButtonComponent {
  /** Texto visible del botón. */
  readonly label = input<string>('');

  /** Estilo visual: `primary`, `secondary` o `danger`. */
  readonly variant = input<ButtonVariant>('primary');

  /** Tamaño: `sm`, `md` o `lg`. */
  readonly size = input<ButtonSize>('md');

  /** Bloquea la interacción. Acepta también el atributo sin valor: `<ui-button disabled>`. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Muestra un spinner inline y bloquea el click mientras es `true`. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Atributo `type` nativo. Por defecto `button` para no enviar formularios por accidente. */
  readonly type = input<ButtonType>('button');

  /** Si es `true`, el botón ocupa todo el ancho disponible. */
  readonly fullWidth = input(false, { transform: booleanAttribute });

  /** Etiqueta accesible alternativa (útil si el botón solo tiene un icono). */
  readonly ariaLabel = input<string | null>(null);

  /** Se emite al hacer click, solo si el botón no está `disabled` ni `loading`. */
  readonly clicked = output<void>();

  /** `true` cuando el botón acepta clicks. */
  protected readonly isInteractive = computed(() => !this.disabled() && !this.loading());

  /** Clases finales del `<button>` combinando variante, tamaño y estado. */
  protected readonly classes = computed(() => {
    const variant = this.variant();
    const stateClasses = this.loading()
      ? 'cursor-wait opacity-80'
      : this.disabled()
        ? 'cursor-not-allowed opacity-50'
        : `cursor-pointer ${INTERACTIVE_CLASSES[variant]}`;

    return [
      BASE_CLASSES,
      VARIANT_CLASSES[variant],
      SIZE_CLASSES[this.size()],
      stateClasses,
      this.fullWidth() ? 'w-full' : '',
    ].join(' ');
  });

  /**
   * Maneja el click nativo. Aunque el `<button>` ya queda `disabled`
   * mientras carga, la guarda aquí protege también clicks programáticos.
   */
  protected handleClick(event: MouseEvent): void {
    if (!this.isInteractive()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.clicked.emit();
  }
}
