import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Location } from '../../../core/models';
import { DetailListComponent } from './detail-list.component';
import { DetailField, formatDate, idsFromUrls, orDash } from './detail.utils';

/** Contenido del modal para una ubicación. */
@Component({
  selector: 'app-location-detail',
  standalone: true,
  imports: [DetailListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-detail-list [fields]="fields()" />`,
})
export class LocationDetailComponent {
  /** Ubicación a mostrar. */
  readonly location = input.required<Location>();

  /** Todos los campos del registro, formateados. */
  protected readonly fields = computed<DetailField[]>(() => {
    const l = this.location();
    return [
      { label: 'ID', value: `#${l.id}` },
      { label: 'Nombre', value: l.name },
      { label: 'Tipo', value: orDash(l.type) },
      { label: 'Dimensión', value: orDash(l.dimension) },
      { label: `Residentes (${l.residents.length})`, value: idsFromUrls(l.residents) },
      { label: 'Creado en la API', value: formatDate(l.created) },
      { label: 'URL', value: l.url, mono: true },
    ];
  });
}
