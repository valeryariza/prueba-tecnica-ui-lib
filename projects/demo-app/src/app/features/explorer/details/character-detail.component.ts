import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Character } from '../../../core/models';
import { DetailListComponent } from './detail-list.component';
import { DetailField, formatDate, idsFromUrls, orDash } from './detail.utils';

const STATUS_DOT: Record<Character['status'], string> = {
  Alive: 'bg-portal-400',
  Dead: 'bg-ui-danger',
  unknown: 'bg-ui-text-muted',
};

/** Contenido del modal para un personaje: imagen + todos sus campos. */
@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [DetailListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-5 sm:flex-row">
      <div class="shrink-0 self-center sm:self-start">
        <img
          [src]="character().image"
          [alt]="'Imagen de ' + character().name"
          width="160"
          height="160"
          class="h-40 w-40 rounded-2xl object-cover ring-4 ring-portal-400/40"
        />
        <p class="mt-2 flex items-center justify-center gap-2 text-sm font-semibold">
          <span class="h-2.5 w-2.5 rounded-full" [class]="statusDot()"></span>{{ character().status }}
        </p>
      </div>
      <app-detail-list class="flex-1" [fields]="fields()" />
    </div>
  `,
})
export class CharacterDetailComponent {
  /** Personaje a mostrar. */
  readonly character = input.required<Character>();

  /** Color del indicador de status. */
  protected readonly statusDot = computed(() => STATUS_DOT[this.character().status]);

  /** Todos los campos del registro, formateados. */
  protected readonly fields = computed<DetailField[]>(() => {
    const c = this.character();
    return [
      { label: 'ID', value: `#${c.id}` },
      { label: 'Nombre', value: c.name },
      { label: 'Status', value: c.status },
      { label: 'Especie', value: c.species },
      { label: 'Tipo', value: orDash(c.type) },
      { label: 'Género', value: c.gender },
      { label: 'Origen', value: c.origin.name },
      { label: 'Ubicación actual', value: c.location.name },
      { label: `Episodios (${c.episode.length})`, value: idsFromUrls(c.episode) },
      { label: 'Creado en la API', value: formatDate(c.created) },
      { label: 'URL', value: c.url, mono: true },
      { label: 'Imagen', value: c.image, mono: true },
    ];
  });
}
