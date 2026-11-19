import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Episode } from '../../../core/models';
import { DetailListComponent } from './detail-list.component';
import { DetailField, formatDate, idsFromUrls } from './detail.utils';

/** Contenido del modal para un episodio. */
@Component({
  selector: 'app-episode-detail',
  standalone: true,
  imports: [DetailListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="mb-4 inline-flex items-center rounded-full bg-morty/15 px-3 py-1 font-mono text-sm font-bold text-morty">
      {{ episode().episode }}
    </p>
    <app-detail-list [fields]="fields()" />
  `,
})
export class EpisodeDetailComponent {
  /** Episodio a mostrar. */
  readonly episode = input.required<Episode>();

  /** Todos los campos del registro, formateados. */
  protected readonly fields = computed<DetailField[]>(() => {
    const e = this.episode();
    return [
      { label: 'ID', value: `#${e.id}` },
      { label: 'Nombre', value: e.name },
      { label: 'Código', value: e.episode },
      { label: 'Fecha de emisión', value: e.air_date },
      { label: `Personajes (${e.characters.length})`, value: idsFromUrls(e.characters) },
      { label: 'Creado en la API', value: formatDate(e.created) },
      { label: 'URL', value: e.url, mono: true },
    ];
  });
}
