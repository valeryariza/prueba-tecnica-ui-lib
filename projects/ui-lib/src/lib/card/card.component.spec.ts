import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

@Component({
  standalone: true,
  imports: [CardComponent],
  template: `
    <ui-card title="Rick Sanchez" subtitle="Human" [interactiveHeader]="true" (headerClicked)="clicks = clicks + 1">
      <p class="projected">Contenido proyectado</p>
    </ui-card>
  `,
})
class HostComponent {
  clicks = 0;
}

describe('CardComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('proyecta contenido en el body y muestra título y subtítulo', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')?.textContent).toContain('Rick Sanchez');
    expect(el.textContent).toContain('Human');
    expect(el.querySelector('.projected')).not.toBeNull();
  });

  it('emite headerClicked con click y con Enter', () => {
    const header = (fixture.nativeElement as HTMLElement).querySelector('header') as HTMLElement;
    header.click();
    header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(fixture.componentInstance.clicks).toBe(2);
  });
});
