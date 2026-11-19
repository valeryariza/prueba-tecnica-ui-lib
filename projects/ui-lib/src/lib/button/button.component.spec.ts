import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let clicks: number;

  const nativeButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button') as HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ButtonComponent] });
    fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('label', 'Abrir portal');
    clicks = 0;
    fixture.componentInstance.clicked.subscribe(() => clicks++);
    fixture.detectChanges();
  });

  it('muestra el label', () => {
    expect(nativeButton().textContent).toContain('Abrir portal');
  });

  it('emite clicked al hacer click', () => {
    nativeButton().click();
    expect(clicks).toBe(1);
  });

  it('no emite clicked cuando está disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    nativeButton().click();

    expect(nativeButton().disabled).toBe(true);
    expect(clicks).toBe(0);
  });

  it('muestra spinner y no emite clicked cuando está loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    nativeButton().click();

    expect(fixture.nativeElement.querySelector('[data-testid="button-spinner"]')).not.toBeNull();
    expect(nativeButton().getAttribute('aria-busy')).toBe('true');
    expect(clicks).toBe(0);
  });

  it('aplica clases distintas para cada variante', () => {
    const classesFor = (variant: 'primary' | 'secondary' | 'danger'): string => {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();
      return nativeButton().className;
    };

    expect(classesFor('primary')).toContain('bg-ui-primary');
    expect(classesFor('secondary')).toContain('border-ui-secondary');
    expect(classesFor('danger')).toContain('bg-ui-danger');
  });

  it('acepta disabled como atributo booleano', () => {
    fixture.componentRef.setInput('disabled', '');
    fixture.detectChanges();
    expect(nativeButton().disabled).toBe(true);
  });
});
