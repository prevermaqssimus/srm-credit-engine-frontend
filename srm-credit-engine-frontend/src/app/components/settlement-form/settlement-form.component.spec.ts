import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SettlementFormComponent } from './settlement-form.component';
import { Receivable } from '../../models/receivable.model';
import { Currency, ReceivableType, SettlementStatus } from '../../models/enums';
import { environment } from '../../../environments/environment';

describe('SettlementFormComponent', () => {
  let component: SettlementFormComponent;
  let fixture: ComponentFixture<SettlementFormComponent>;
  let httpMock: HttpTestingController;

  const mockReceivable: Receivable = {
    id: 1,
    cedente: 'Fábrica XYZ',
    sacado: 'Loja ABC',
    faceValue: 100000,
    paymentCurrency: Currency.BRL,
    termMonths: 3,
    type: ReceivableType.DUPLICATA_MERCANTIL,
    status: SettlementStatus.PENDING,
    createdAt: new Date().toISOString(),
    version: 0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettlementFormComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SettlementFormComponent);
    component = fixture.componentInstance;
    component.receivable = mockReceivable;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should pre-select the receivable payment currency on init', () => {
    fixture.detectChanges();
    expect(component.selectedCurrency()).toBe(Currency.BRL);
  });

  /**
   * O teste mais importante deste passo: confirma que a idempotencyKey
   * é a MESMA em duas tentativas de confirm(), mesmo se a primeira
   * falhar -- é exatamente essa garantia que protege contra duplicação
   * caso o operador clique de novo após um erro de rede.
   */
  it('should reuse the same idempotency key across multiple submit attempts', () => {
    fixture.detectChanges();

    component.confirm();
    const firstRequest = httpMock.expectOne(`${environment.apiBaseUrl}/settlements`);
    const firstKey = firstRequest.request.body.idempotencyKey;
    firstRequest.flush('erro simulado', { status: 500, statusText: 'Internal Server Error' });

    component.confirm();
    const secondRequest = httpMock.expectOne(`${environment.apiBaseUrl}/settlements`);
    const secondKey = secondRequest.request.body.idempotencyKey;

    expect(secondKey).toBe(firstKey);
  });

  /**
   * Confirma que confirm() não dispara uma segunda requisição enquanto
   * a primeira ainda está em voo -- a defesa client-side contra duplo
   * clique físico.
   */
  it('should not submit a second request while one is already in flight', () => {
    fixture.detectChanges();

    component.confirm();
    expect(component.isSubmitting()).toBe(true);

    component.confirm(); // segunda chamada, deveria ser ignorada

    httpMock.expectOne(`${environment.apiBaseUrl}/settlements`); // só UMA requisição no total
  });

  it('should set isSubmitting to false and emit settled on success', () => {
    fixture.detectChanges();
    let emitted: unknown;
    component.settled.subscribe((settlement) => (emitted = settlement));

    component.confirm();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/settlements`);
    req.flush({ id: 1, receivableId: 1 });

    expect(component.isSubmitting()).toBe(false);
    expect(emitted).toBeTruthy();
  });
});
