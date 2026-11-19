import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { TableAction, TableColumn } from './table.types';

interface Row {
  id: number;
  name: string;
  tags: string[];
}

describe('TableComponent', () => {
  let fixture: ComponentFixture<TableComponent<Row>>;
  const columns: TableColumn<Row>[] = [
    { key: 'name', header: 'Nombre' },
    { key: 'tags', header: 'Tags', cell: (r) => r.tags.join(', ') },
  ];
  const rows: Row[] = [
    { id: 1, name: 'Rick', tags: ['scientist'] },
    { id: 2, name: 'Morty', tags: [] },
  ];

  const query = (selector: string): HTMLElement | null =>
    fixture.nativeElement.querySelector(selector) as HTMLElement | null;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TableComponent] });
    fixture = TestBed.createComponent<TableComponent<Row>>(TableComponent);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('rows', rows);
    fixture.detectChanges();
  });

  it('renderiza una fila por registro usando cell cuando existe', () => {
    const renderedRows = fixture.nativeElement.querySelectorAll('[data-testid="table-row"]');
    expect(renderedRows.length).toBe(2);
    expect(renderedRows[0].textContent).toContain('scientist');
  });

  it('muestra skeleton rows mientras loading es true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('skeletonRows', 3);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-testid="table-skeleton-row"]').length).toBe(3);
  });

  it('muestra el estado vacío con el mensaje configurado', () => {
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('emptyMessage', 'Nada por aquí');
    fixture.detectChanges();
    expect(query('[data-testid="table-empty"]')?.textContent).toContain('Nada por aquí');
  });

  it('muestra el estado de error con prioridad sobre empty', () => {
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('errorMessage', 'Falló la red');
    fixture.detectChanges();
    expect(query('[data-testid="table-error"]')?.textContent).toContain('Falló la red');
    expect(query('[data-testid="table-empty"]')).toBeNull();
  });

  it('emite actionTriggered con la acción y la fila', () => {
    const emitted: TableAction<Row>[] = [];
    fixture.componentInstance.actionTriggered.subscribe((e) => emitted.push(e));

    const buttons = Array.from(
      (query('table') as HTMLElement).querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const deleteButton = buttons.find((b) => b.textContent?.includes('Eliminar'));
    const viewButton = buttons.find((b) => b.textContent?.includes('Ver detalle'));
    viewButton?.click();
    deleteButton?.click();

    expect(emitted).toEqual([
      { action: 'view', row: rows[0] },
      { action: 'delete', row: rows[0] },
    ]);
  });
});
