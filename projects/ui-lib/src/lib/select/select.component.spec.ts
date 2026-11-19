import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectComponent } from './select.component';
import { SelectOption } from './select.types';

type Status = 'alive' | 'dead';

describe('SelectComponent', () => {
  let fixture: ComponentFixture<SelectComponent<Status>>;
  const options: SelectOption<Status>[] = [
    { label: 'Alive', value: 'alive' },
    { label: 'Dead', value: 'dead' },
  ];

  const nativeSelect = (): HTMLSelectElement =>
    fixture.nativeElement.querySelector('select') as HTMLSelectElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SelectComponent] });
    fixture = TestBed.createComponent<SelectComponent<Status>>(SelectComponent);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('label', 'Estado');
    fixture.detectChanges();
  });

  it('muestra el placeholder cuando value es null', () => {
    expect(nativeSelect().selectedIndex).toBe(0);
  });

  it('actualiza el model y emite la opción completa al cambiar', () => {
    const emitted: SelectOption<Status>[] = [];
    fixture.componentInstance.selectionChange.subscribe((o) => emitted.push(o));

    nativeSelect().value = 'dead';
    nativeSelect().dispatchEvent(new Event('change'));

    expect(fixture.componentInstance.value()).toBe('dead');
    expect(emitted).toEqual([{ label: 'Dead', value: 'dead' }]);
  });

  it('vuelve al placeholder cuando el padre resetea value a null', () => {
    fixture.componentRef.setInput('value', 'alive');
    fixture.detectChanges();
    expect(nativeSelect().value).toBe('alive');

    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();
    expect(nativeSelect().selectedIndex).toBe(0);
  });

  it('muestra el skeleton cuando loading es true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="select-loading"]')).not.toBeNull();
    expect(nativeSelect()).toBeNull();
  });
});
