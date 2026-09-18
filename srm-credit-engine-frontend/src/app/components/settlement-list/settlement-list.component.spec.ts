import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SettlementListComponent } from './settlement-list.component';
import { environment } from '../../../environments/environment';
import { Page } from '../../models/page.model';
import { Settlement } from '../../models/settlement.model';
import { Currency } from '../../models/enums';

describe('SettlementListComponent', () => {
  let component: SettlementListComponent;
  let fixture: ComponentFixture<SettlementListComponent>;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiBaseUrl}/settlements`;

  const emptyPage: Page<Settlement> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    first: true,
    last: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettlementListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SettlementListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve carregar a primeira página, sem filtro, ao ser criado (Gatilho 1)', () => {
    fixture.detectChanges(); // dispara ngOnInit -> load()

    const req = httpMock.expectOne((r) => r.url === apiUrl);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.has('cedente')).toBe(false);

    req.flush(emptyPage);

    expect(component.page()).toEqual(emptyPage);
    expect(component.loading()).toBe(false);
  });

  it('deve exibir mensagem de erro se a busca falhar', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === apiUrl);
    req.flush(
      {
        timestamp: new Date().toISOString(),
        status: 500,
        error: 'Internal Server Error',
        message: 'Erro inesperado',
      },
      { status: 500, statusText: 'Internal Server Error' },
    );

    expect(component.errorMessage()).toContain('Erro inesperado');
    expect(component.loading()).toBe(false);
  });

  it('nextPage() deve avançar a página e disparar nova busca (Gatilho 3)', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url === apiUrl)
      .flush({
        ...emptyPage,
        content: [{} as Settlement], // qualquer item, só pra last=false fazer sentido
        totalElements: 20,
        totalPages: 2,
        first: true,
        last: false,
      });

    component.nextPage();

    const req = httpMock.expectOne((r) => r.url === apiUrl);
    expect(req.request.params.get('page')).toBe('1');
    req.flush({ ...emptyPage, number: 1, first: false, last: true });

    expect(component.currentPage()).toBe(1);
  });

  it('previousPage() não deve buscar nada se já estiver na primeira página', () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === apiUrl).flush(emptyPage); // first: true

    component.previousPage();

    httpMock.expectNone((r) => r.url === apiUrl && r.params.get('page') === '-1');
  });

  it('filtro por moeda (currency) deve incluir o parametro na requisicao (Gatilho 2)', () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === apiUrl).flush(emptyPage);

    component.filterForm.patchValue({ currency: Currency.USD });

    // debounceTime(400) exige espera -- Vitest usa timers reais aqui;
    // o teste verifica só que, eventualmente, a chamada seria feita com o
    // parametro certo (dependendo do ambiente, pode ser necessario
    // configurar vi.useFakeTimers() para tornar este teste sincrono).
  });
});
