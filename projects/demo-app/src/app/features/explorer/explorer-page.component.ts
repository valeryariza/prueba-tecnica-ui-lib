import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  ButtonComponent,
  CardComponent,
  SelectComponent,
  SelectOption,
  TableActionType,
  TableComponent,
} from 'ui-lib';
import { ResourceSelection, ResourceType, StatusFilter } from '../../core/models';
import { ExplorerStore } from '../../core/state/explorer.store';
import { ModalComponent } from '../../shared/components/modal.component';
import { PortalComponent } from '../../shared/components/portal.component';
import { CharacterDetailComponent } from './details/character-detail.component';
import { EpisodeDetailComponent } from './details/episode-detail.component';
import { LocationDetailComponent } from './details/location-detail.component';
import {
  CHARACTER_COLUMNS,
  EPISODE_COLUMNS,
  LOCATION_COLUMNS,
  RESOURCE_LABELS,
  RESOURCE_OPTIONS,
  STATUS_OPTIONS,
} from './explorer.config';

/** Último evento emitido por `actionTriggered`, para mostrarlo en pantalla. */
interface EmittedEvent {
  readonly action: TableActionType;
  readonly resource: ResourceType;
  readonly id: number;
  readonly name: string;
}

/**
 * Página principal: integra los cuatro componentes de ui-lib.
 *
 * No guarda estado de datos ni hace HTTP: lee el `ExplorerStore` y le delega
 * las acciones. Solo maneja estado de UI local (modales y toast).
 */
@Component({
  selector: 'app-explorer-page',
  standalone: true,
  imports: [
    ButtonComponent,
    CardComponent,
    SelectComponent,
    TableComponent,
    ModalComponent,
    PortalComponent,
    CharacterDetailComponent,
    EpisodeDetailComponent,
    LocationDetailComponent,
    JsonPipe,
  ],
  templateUrl: './explorer-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerPageComponent implements OnInit {
  protected readonly store = inject(ExplorerStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly resourceOptions = RESOURCE_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly characterColumns = CHARACTER_COLUMNS;
  protected readonly episodeColumns = EPISODE_COLUMNS;
  protected readonly locationColumns = LOCATION_COLUMNS;

  /** Clave estable para el `track` de la tabla. */
  protected readonly trackById = (row: { readonly id: number }): number => row.id;

  /** Registro abierto en el modal de detalle. */
  protected readonly detail = signal<ResourceSelection | null>(null);
  /** Alterna el modal entre la vista formateada y el JSON crudo (clic en el header de la card). */
  protected readonly showRawJson = signal(false);
  /** Registro pendiente de confirmar su eliminación. */
  protected readonly pendingDelete = signal<ResourceSelection | null>(null);
  /** Último evento emitido por la tabla. */
  protected readonly lastEvent = signal<EmittedEvent | null>(null);
  /** Mensaje del toast, o `null` si no hay. */
  protected readonly toast = signal<string | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  /** Textos en español del recurso activo. */
  protected readonly labels = computed(() => RESOURCE_LABELS[this.store.resource()]);

  /** Mensaje del estado vacío, adaptado al filtro activo. */
  protected readonly emptyMessage = computed(() => {
    const status = this.store.status();
    const label = STATUS_OPTIONS.find((o) => o.value === status)?.label;
    return label
      ? `Ni en esta dimensión hay ${this.labels().many} con status "${label}".`
      : `Este rincón del multiverso está vacío: no quedan ${this.labels().many} en esta página.`;
  });

  /** Texto resumen "Mostrando X de Y". */
  protected readonly summary = computed(() => {
    const shown = this.store.records().items.length;
    const total = this.store.totalCount();
    return `${shown} de ${total.toLocaleString('es-CO')} ${this.labels().many}`;
  });

  /** Subtítulo de la card del modal según el tipo de registro. */
  protected readonly detailSubtitle = computed(() => {
    const selection = this.detail();
    if (!selection) return null;
    switch (selection.type) {
      case 'character':
        return `${selection.item.species} · ${selection.item.status}`;
      case 'episode':
        return `${selection.item.episode} · ${selection.item.air_date}`;
      case 'location':
        return `${selection.item.type || 'Sin tipo'} · ${selection.item.dimension || 'Dimensión desconocida'}`;
    }
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.toastTimer) clearTimeout(this.toastTimer);
    });
  }

  ngOnInit(): void {
    this.store.load();
  }

  /** Cambio en el select de recurso. */
  protected onResourceChange(option: SelectOption<ResourceType>): void {
    this.store.setResource(option.value);
  }

  /** Cambio en el select de filtro. */
  protected onStatusChange(option: SelectOption<StatusFilter>): void {
    this.store.setStatus(option.value);
  }

  /**
   * Recibe `actionTriggered` de la tabla. La tabla es genérica y no sabe de
   * qué recurso es la fila, así que el template le añade el `type` al llamar:
   * `onTableAction({ type: 'character', item: $event.row }, $event.action)`.
   * Con eso `selection` es una unión discriminada bien tipada, sin casts.
   */
  protected onTableAction(selection: ResourceSelection, action: TableActionType): void {
    const { type, item } = selection;
    this.lastEvent.set({ action, resource: type, id: item.id, name: item.name });
    console.info('[ui-table] actionTriggered', { action, row: item });

    if (action === 'view') {
      this.showRawJson.set(false);
      this.detail.set(selection);
    } else {
      this.pendingDelete.set(selection);
    }
  }

  /** Confirma la eliminación pendiente. */
  protected confirmDelete(): void {
    const selection = this.pendingDelete();
    if (!selection) return;
    this.store.removeRecord(selection.type, selection.item.id);
    this.pendingDelete.set(null);
    this.showToast(`«${selection.item.name}» fue enviado a otra dimensión (eliminado de la vista local).`);
  }

  /** Muestra un aviso temporal. */
  private showToast(message: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.set(message);
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }
}
