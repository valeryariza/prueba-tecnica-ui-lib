import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CardElevation } from './card.types';

const ELEVATION_CLASSES: Record<CardElevation, string> = {
  flat: 'bg-ui-surface-muted',
  raised: 'bg-ui-surface-raised shadow-xl shadow-black/30 ring-1 ring-ui-border/60',
  outlined: 'border border-ui-border bg-transparent',
};

/**
 * Contenedor con header (título + subtítulo), body y footer opcionales.
 *
 * Slots de proyección:
 * - contenido por defecto → body.
 * - `[uiCardHeaderActions]` → acciones a la derecha del título.
 * - `[uiCardFooter]` → pie de la card (se oculta si queda vacío).
 *
 * @example
 * <ui-card title="Rick Sanchez" subtitle="Human · Alive" elevation="raised">
 *   <p>Contenido del body</p>
 *   <div uiCardFooter><ui-button label="Cerrar" /></div>
 * </ui-card>
 */
@Component({
  selector: 'ui-card',
  standalone: true,
  templateUrl: './card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class CardComponent {
  /** Título del header de la card. */
  readonly title = input.required<string>();

  /** Subtítulo opcional que aparece bajo el título. */
  readonly subtitle = input<string | null>(null);

  /** Estilo visual del contenedor. */
  readonly elevation = input<CardElevation>('raised');

  /**
   * Da al header apariencia y semántica de elemento interactivo
   * (cursor, hover, foco por teclado y `role="button"`).
   * `headerClicked` se emite siempre; este input solo controla la affordance.
   */
  readonly interactiveHeader = input(false, { transform: booleanAttribute });

  /** Id del título, útil para enlazar `aria-labelledby` desde un modal. */
  readonly titleId = input<string | null>(null);

  /** Se emite al hacer clic (o Enter / Espacio si `interactiveHeader`) en el header. */
  readonly headerClicked = output<void>();

  /** Clases del contenedor según la elevación. */
  protected readonly containerClasses = computed(
    () => `flex flex-col overflow-hidden rounded-2xl text-ui-text ${ELEVATION_CLASSES[this.elevation()]}`,
  );

  /** Clases del header según si es interactivo. */
  protected readonly headerClasses = computed(() =>
    this.interactiveHeader()
      ? 'cursor-pointer transition-colors hover:bg-ui-text/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus'
      : '',
  );

  /** Emite `headerClicked`. */
  protected onHeaderClick(): void {
    this.headerClicked.emit();
  }

  /** Permite activar el header con teclado cuando es interactivo. */
  protected onHeaderKeydown(event: KeyboardEvent): void {
    if (!this.interactiveHeader()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.headerClicked.emit();
    }
  }
}
