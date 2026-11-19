import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type PortalSize = 'sm' | 'md' | 'lg';

const SIZE: Record<PortalSize, string> = {
  sm: 'h-10 w-10',
  md: 'h-24 w-24',
  lg: 'h-36 w-36',
};

/**
 * Ilustración decorativa de un portal verde, hecha solo con CSS
 * (sin imágenes con derechos de autor).
 */
@Component({
  selector: 'app-portal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block', 'aria-hidden': 'true' },
  template: `
    <div class="relative" [class]="sizeClass()">
      <div
        class="absolute inset-0 animate-portal-spin rounded-full blur-[1px]"
        style="background: conic-gradient(from 0deg, #4d7a1d, #b9e67e, #97ce4c, #f3fbe8, #7fb53a, #4d7a1d)"
      ></div>
      <div
        class="absolute inset-[14%] animate-portal-spin rounded-full [animation-direction:reverse]"
        style="background: conic-gradient(from 90deg, #97ce4c, #2f5212, #b9e67e, #97ce4c)"
      ></div>
      <div class="absolute inset-[30%] rounded-full bg-portal-50/90 blur-md"></div>
      <div class="absolute -inset-2 rounded-full bg-portal-400/25 blur-xl"></div>
    </div>
  `,
})
export class PortalComponent {
  /** Tamaño de la ilustración. */
  readonly size = input<PortalSize>('md');

  /** Clases de tamaño. */
  protected readonly sizeClass = computed(() => SIZE[this.size()]);
}
