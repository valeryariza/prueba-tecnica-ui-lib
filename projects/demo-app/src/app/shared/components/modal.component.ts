import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Contenedor de diálogo modal: fondo oscuro, cierre con Escape o clic fuera,
 * foco inicial dentro del diálogo y devolución del foco al cerrarse.
 * El contenido (normalmente una `ui-card`) se proyecta con `ng-content`.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closed.emit()',
    '(keydown.tab)': 'trapFocus($event)',
    '(keydown.shift.tab)': 'trapFocus($event)',
  },
  template: `
    <div class="fixed inset-0 z-40 bg-space-900/80 backdrop-blur-sm animate-fade-in" (click)="closed.emit()"></div>
    <div class="pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div
        class="pointer-events-auto max-h-[90vh] w-full overflow-y-auto rounded-2xl animate-pop-in"
        [class]="widthClass()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="labelledBy()"
      >
        <ng-content />
      </div>
    </div>
  `,
})
export class ModalComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);

  /** Id del elemento que da nombre al diálogo. */
  readonly labelledBy = input<string | null>(null);

  /** Ancho máximo del diálogo (clase Tailwind). */
  readonly widthClass = input<string>('max-w-2xl');

  /** Se emite cuando el usuario pide cerrar (Escape o clic en el fondo). */
  readonly closed = output<void>();

  constructor() {
    const previouslyFocused = this.document.activeElement;
    const body = this.document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    afterNextRender(() => {
      this.focusables()[0]?.focus();
    });

    inject(DestroyRef).onDestroy(() => {
      body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    });
  }

  /** Mantiene el foco dentro del diálogo al navegar con Tab. */
  protected trapFocus(event: Event): void {
    const items = this.focusables();
    if (items.length === 0 || !(event instanceof KeyboardEvent)) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = this.document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusables(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE));
  }
}
