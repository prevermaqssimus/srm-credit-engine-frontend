import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    component.title = 'Título de Teste';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the given title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Título de Teste');
  });

  it('should emit closed when the close button is clicked', () => {
    let closed = false;
    component.closed.subscribe(() => (closed = true));

    const closeButton = fixture.nativeElement.querySelector('.modal-close') as HTMLButtonElement;
    closeButton.click();

    expect(closed).toBe(true);
  });

  it('should emit closed when the click target is the backdrop itself', () => {
    let closed = false;
    component.closed.subscribe(() => (closed = true));

    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop') as HTMLElement;
    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: backdrop });
    Object.defineProperty(event, 'currentTarget', { value: backdrop });

    component.onBackdropClick(event);

    expect(closed).toBe(true);
  });

  it('should NOT emit closed when the click target is inside the modal content', () => {
    let closed = false;
    component.closed.subscribe(() => (closed = true));

    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop') as HTMLElement;
    const content = fixture.nativeElement.querySelector('.modal-content') as HTMLElement;
    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: content });
    Object.defineProperty(event, 'currentTarget', { value: backdrop });

    component.onBackdropClick(event);

    expect(closed).toBe(false);
  });
});
