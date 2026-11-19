/*
 * Public API de ui-lib.
 * Todo lo que la demo-app (o cualquier consumidor) puede importar sale de aquí.
 */

// Button
export * from './lib/button/button.component';
export * from './lib/button/button.types';

// Card
export * from './lib/card/card.component';
export * from './lib/card/card.types';

// Select
export * from './lib/select/select.component';
export * from './lib/select/select.types';

// Table
export * from './lib/table/table.component';
export * from './lib/table/table.types';

// Spinner (utilidad usada por Button y Select; se exporta por si el consumidor la necesita)
export * from './lib/spinner/spinner.component';
