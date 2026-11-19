import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExplorerPageComponent } from './features/explorer/explorer-page.component';
import { PortalComponent } from './shared/components/portal.component';

/** Shell de la aplicación: header temático, contenido y footer. */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ExplorerPageComponent, PortalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex min-h-screen max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
      <header class="flex items-center gap-4 py-6 sm:py-10">
        <app-portal size="sm" class="sm:hidden" />
        <app-portal size="md" class="hidden sm:inline-block" />
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-rick">Dimensión C-137 · ui-lib demo</p>
          <h1 class="font-display text-3xl leading-none tracking-wide text-portal-400 text-portal-glow sm:text-5xl">
            Portal Explorer
          </h1>
          <p class="mt-1 text-sm text-ui-text-muted">Personajes, episodios y ubicaciones del multiverso.</p>
        </div>
      </header>

      <main class="flex-1 pb-12">
        <app-explorer-page />
      </main>

      <footer class="border-t border-ui-border/60 py-6 text-center text-xs text-ui-text-muted">
        Datos de la
        <a class="text-rick underline-offset-2 hover:underline" href="https://rickandmortyapi.com" target="_blank" rel="noopener">
          Rick and Morty API
        </a>
        · Componentes de <span class="font-semibold text-ui-text">ui-lib</span> · Angular + Tailwind CSS v3
      </footer>
    </div>
  `,
})
export class AppComponent {}
