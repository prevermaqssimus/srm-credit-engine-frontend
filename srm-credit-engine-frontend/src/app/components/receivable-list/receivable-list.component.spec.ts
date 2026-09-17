import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReceivableListComponent } from './receivable-list.component';
import { environment } from '../../../environments/environment';
import { Currency, ReceivableType, SettlementStatus } from '../../models/enums';
import { Receivable } from '../../models/receivable.model';

describe('ReceivableListComponent', () => {
  let component: ReceivableListComponent;
  let fixture: ComponentFixture<ReceivableListComponent>;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiBaseUrl}/receivables`;

  const mockReceivable: Receivable = {
    id: 1,
    type: ReceivableType.DUPLICATA_MERCANTIL,
    faceValue: 100000,
    termMonths: 3,
    paymentCurrency: Currency.BRL,
    cedente: 'Fábrica XYZ',
    sacado: 'Loja ABC',
    status: SettlementStatus.PENDING,
    createdAt: new Date().toISOString(),
    version: 0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivableListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceivableListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado e carregar a lista automaticamente (no construtor)', () => {
    expect(component).toBeTruthy();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockReceivable]);

    expect(component.receivables()).toEqual([mockReceivable]);
    expect(component.loading()).toBe(false);
  });

  it('reload() deve recarregar a lista sob demanda', () => {
    httpMock.expectOne(apiUrl).flush([]); // carga inicial do construtor

    component.reload();
    const req = httpMock.expectOne(apiUrl);
    req.flush([mockReceivable]);

    expect(component.receivables().length).toBe(1);
  });

  it('deve emitir selectForSettlement quando solicitado', () => {
    httpMock.expectOne(apiUrl).flush([mockReceivable]);

    let emitted: Receivable | undefined;
    component.selectForSettlement.subscribe((r) => (emitted = r));

    component.selectForSettlement.emit(mockReceivable);

    expect(emitted).toEqual(mockReceivable);
  });

  it('deve exibir mensagem de erro se a listagem falhar', () => {
    const req = httpMock.expectOne(apiUrl);
    req.flush('erro', { status: 500, statusText: 'Internal Server Error' });

    expect(component.errorMessage()).toContain('HTTP 500');
    expect(component.loading()).toBeFalse();
  });
});
