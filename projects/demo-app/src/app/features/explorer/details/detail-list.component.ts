import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DetailField } from './detail.utils';

/** Lista de pares etiqueta/valor para el modal de detalle. */
@Component({
  selector: 'app-detail-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      @for (field of fields(); track field.label) {
        <div class="min-w-0 rounded-lg bg-ui-surface-muted/60 px-3 py-2">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-ui-text-muted">{{ field.label }}</dt>
          <dd class="mt-0.5 break-words text-sm" [class.font-mono]="field.mono" [class.text-xs]="field.mono">{{ field.value }}</dd>
        </div>
      }
    </dl>
  `,
})
export class DetailListComponent {
  /** Campos a mostrar. */
  readonly fields = input.required<readonly DetailField[]>();
}
