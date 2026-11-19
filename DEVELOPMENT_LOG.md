# Bitácora de desarrollo — DEVELOPMENT_LOG.md

Proyecto: **Portal Explorer · ui-lib** (Angular + TypeScript + Tailwind CSS v3)
Autora: Ariza Hernandez Valery Michell

---

## 1. Resumen del proceso

| Paso | Qué se hizo | Commit(s) |
| --- | --- | --- |
| 1 | Workspace Angular vacío (`--no-create-application`) y generación de `ui-lib` (prefijo `ui`) y `demo-app` (prefijo `app`). | `chore: scaffold…` |
| 2 | Tailwind CSS **v3.4** (no v4) con un preset propio de la librería basado en variables CSS. | `chore: configure tailwind…` |
| 3 | Cambio de Karma a Jest (`jest-preset-angular`). | `chore: replace karma with jest…` |
| 4 | Componentes de la librería, uno por commit, cada uno con sus tipos, JSDoc y pruebas. | `feat(ui-lib): …` |
| 5 | Modelos tipados, servicio HTTP y store con signals de la demo. | `feat(demo-app): …`, `test(demo-app): …` |
| 6 | Tema visual, shell, modal, vistas de detalle y página del explorador. | `feat(demo-app): …` |
| 7 | Verificación visual en escritorio y móvil, en todos los estados (datos, detalle, confirmación, vacío, carga y error). | — |
| 8 | README y esta bitácora. | `docs: …` |

---

## 2. Decisiones tomadas

### Arquitectura
- **El estado vive en `ExplorerStore`** (`core/state`). Usa signals privados escribibles y los expone con `asReadonly()`, así ningún componente puede modificar el estado sin pasar por un método del store.
- **Solo `RickAndMortyApiService` usa `HttpClient`.** La URL base es un `InjectionToken`; así en las pruebas se cambia por `https://api.test`.
- **`Subject` + `switchMap` para las peticiones.** Cada cambio (recurso, filtro, página) llama `load()`, que emite en el `Subject`. `switchMap` cancela la petición anterior si aún no terminó. El `catchError` va *dentro* del `switchMap`: si fuera afuera, el primer error cerraría el stream y la app dejaría de cargar datos.
- **Path mapping a la fuente.** En `tsconfig.json`, `ui-lib` apunta a `projects/ui-lib/src/public-api.ts`. Así `ng serve demo-app` funciona sin compilar antes la librería, y la demo sigue importando solo desde `'ui-lib'` (nunca rutas internas). La librería se puede compilar aparte con `ng build ui-lib`.

### Librería
- **Temas con variables CSS.** El preset `tailwind-preset.js` define colores como `rgb(var(--ui-color-primary, 37 99 235) / <alpha-value>)`. El formato `R G B` permite opacidades (`bg-ui-primary/20`) y el valor después de la coma es el color por defecto si la app no define la variable.
- **`booleanAttribute` en los inputs booleanos**, para poder escribir `<ui-button disabled>` sin `[disabled]="true"`.
- **Botón:** las clases se calculan en un `computed()`. `clicked` solo se emite si el botón es interactivo; además del `disabled` nativo hay una guarda en `handleClick()` para clicks programáticos.
- **Card:** `headerClicked` se emite siempre, pero el input `interactiveHeader` decide si el header *parece* clicable (cursor, hover, `role="button"`, `tabindex`). Así no aparece un "botón" sin función en las cards que no lo usan.
- **Select:** genérico en `V extends string` para que las opciones de recurso y status tengan valores tipados. Se usa `[selected]` en cada `<option>` en lugar de `[value]` en el `<select>` (ver Retos).
- **Table:** genérica en `T extends object`, con `key: Extract<keyof T, string>`. En móvil muestra tarjetas en lugar de una tabla con scroll horizontal.

### Demo app
- **Columnas por recurso** en `explorer.config.ts`:
  - Characters: nombre, status, especie, género, origen, nº de episodios.
  - Episodes: código, nombre, fecha de emisión, nº de personajes.
  - Locations: nombre, tipo, dimensión, nº de residentes.
- **Filtro de status solo para Characters** (ver Retos).
- **Detalle:** un componente por tipo (`character-detail`, `episode-detail`, `location-detail`) proyectado dentro de `ui-card`. El clic en el header (`headerClicked`) alterna con el JSON crudo, para que se vean *todos* los campos tal como vienen de la API.
- **Eliminar:** confirmación en un modal, eliminación del estado local y aviso (toast). La card "Último evento" muestra el objeto que emitió `actionTriggered`, para que se pueda comprobar en la revisión.

---

## 3. Retos y soluciones

| Reto | Causa | Solución |
| --- | --- | --- |
| Un filtro sin resultados aparecía como **error** | La API responde **404** (`{"error":"There is nothing here"}`) cuando un filtro no tiene coincidencias. | En el servicio, `catchError` convierte un 404 en una página vacía. Así la tabla muestra el estado *empty*. Hay una prueba que lo cubre. |
| **Episodes y Locations no tienen `status`** | El enunciado pide filtrar por status "dentro del recurso activo", pero en la API ese campo solo existe en `/character`. | El filtro se deshabilita en esos recursos con el texto "La API solo permite filtrar por status en Characters". El servicio también ignora `status` si el recurso no es `character`. |
| Error de tipos: `type: string` no es asignable a `'character'` | En `map((res) => ({ type: 'character', … }))` TypeScript ensancha el literal `'character'` a `string`. | Anotar el tipo de retorno del callback: `map((res): LoadedPage => …)`. |
| Una tabla para tres tipos distintos | Si las filas fueran `Character \| Episode \| Location`, `keyof` de la unión solo deja las claves comunes (`id`, `name`…), y columnas como `species` no compilarían. | Unión discriminada `ResourceRecords` + `@if (records.type === …)` en el template. Cada `ui-table` se instancia con su `T` concreto. |
| Casts al recibir `actionTriggered` | Un handler genérico `<K>` obligaba a hacer `as ResourceSelection`. | El template construye el objeto: `onTableAction({ type: 'character', item: $event.row }, $event.action)`. TypeScript lo valida contra la unión sin casts. |
| El select no mostraba el valor inicial de forma fiable | `[value]` en el `<select>` puede aplicarse antes de que existan las `<option>` del `@for`. | `[selected]` en cada `<option>`, más una opción placeholder seleccionada cuando `value() === null`. Hay una prueba del reset a `null`. |
| `Location` choca con el tipo global del DOM | `window.location` es de tipo `Location`. | La interfaz se llama `Location` como pide el enunciado, pero siempre se importa explícitamente desde `core/models` (hay un comentario en el archivo). |
| El build fallaba con `Inlining of fonts failed … 403` | El build de producción descarga Google Fonts para incrustarlas; sin acceso a la red, falla. | Fuentes autoalojadas con `@fontsource/luckiest-guy` y `@fontsource/space-grotesk`, cargadas desde `angular.json`. |
| Jest: `Haste module naming collision: ui-lib` | Después de `ng build ui-lib`, `dist/ui-lib/package.json` y `projects/ui-lib/package.json` tienen el mismo nombre. | `modulePathIgnorePatterns: ['<rootDir>/dist/']` en `jest.config.js`. |

---

## 4. Uso de herramientas de IA

Se usó **Claude (Anthropic)** para generar el proyecto. Siguiendo lo que pide la prueba, aquí queda documentado.

### Prompt utilizado

Se subió el PDF del enunciado (`PRUEBA_TECNICA_FRONTEND.pdf`). Claude primero resumió los requisitos y señaló los puntos delicados (filtro de status solo en Characters, tabla genérica, estado en un servicio con signals). Después, la instrucción fue:

> "mandalo todo completo"

Es decir, se pidió el workspace completo de una vez: librería, demo, pruebas, README y esta bitácora.

### Qué corrigió o descartó la propia IA durante la generación

Esto fue lo que salió mal en la primera versión del código generado y cómo se corrigió antes de entregar:

- **Tipado del `map` en el store:** la primera versión no compilaba porque se ensanchaba el literal `'character'` → se anotó el tipo de retorno.
- **Handler de la tabla con `as`:** la primera versión usaba un cast `as ResourceSelection`. Se descartó porque un cast oculta errores, y se cambió por el objeto construido en el template.
- **`idFromUrl('…/episode/')` devolvía `0`** en lugar de `null`, porque `Number('')` es `0`. La prueba unitaria lo detectó y se cambió por una validación con regex.
- **Clases de host del botón:** un `[class]` en el host habría reemplazado las clases que pone el consumidor (p. ej. `class="flex-1"`). Se cambió por bindings `[class.x]` individuales.
- **Commit mal etiquetado:** el store se había marcado como `refactor:` cuando en realidad es una funcionalidad nueva; se cambió a `feat:`.
- **Google Fonts → Fontsource**, por el error de build descrito en Retos.

### Revisión propia (completar antes de entregar)

> ⚠️ Esta sección la debe escribir la autora con sus palabras, después de revisar el código. La prueba evalúa poder explicar y defender cada parte.

**Qué acepté y por qué:**
- _…_

**Qué modifiqué o rechacé y por qué:**
- _…_

**Prompts adicionales que usé (si los hubo):**
- _…_

Lista de preguntas para practicar antes de la revisión:
- [ ] ¿Por qué `input()` / `output()` / `model()` en lugar de `@Input()` / `@Output()`? ¿Qué gana OnPush con signals?
- [ ] ¿Qué diferencia hay entre `model()` e `input()`? ¿Cuándo se emite `valueChange`?
- [ ] ¿Cómo infiere Angular el tipo `T` de `ui-table`? ¿Qué pasa si escribo mal un `key` de columna?
- [ ] ¿Por qué el store usa `switchMap` y no `mergeMap`? ¿Por qué el `catchError` va dentro?
- [ ] ¿Por qué un 404 se trata como lista vacía?
- [ ] ¿Cómo llega el tema Rick & Morty a los componentes de la librería si la librería no tiene esos colores?
- [ ] ¿Por qué la demo no puede importar `projects/ui-lib/src/lib/...` directamente?
- [ ] ¿Qué hace `booleanAttribute`?
- [ ] ¿Cómo se proyecta el detalle dentro de `ui-card`? ¿Qué slots tiene la card?

---

## 5. Pendientes / deseables

- [x] Pruebas unitarias (Jest): 4 componentes de la librería + store + utilidades.
- [ ] Storybook.
- [ ] Publicar `ui-lib` en npm o GitHub Packages (`npm run build:lib` y `npm publish dist/ui-lib`).
- [ ] Desplegar la demo en Vercel / Netlify (comando de build: `npm run build:demo`; carpeta de salida: `dist/demo-app/browser`).
- [ ] Video explicativo.
