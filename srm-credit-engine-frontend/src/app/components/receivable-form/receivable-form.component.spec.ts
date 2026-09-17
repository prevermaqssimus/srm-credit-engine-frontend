import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReceivableFormComponent } from './receivable-form.component';
import { Currency, ReceivableType } from '../../models/enums';
import { environment } from '../../../environments/environment';
import { Receivable } from '../../models/receivable.model';

describe('ReceivableFormComponent', () => {
  let component: ReceivableFormComponent;
  let fixture: ComponentFixture<ReceivableFormComponent>;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiBaseUrl}/receivables`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivableFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceivableFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('não deve chamar a API se o formulário estiver inválido', () => {
    // Formulário nasce inválido (faceValue, termMonths, cedente, sacado vazios).
    component.submit();
    httpMock.expectNone(apiUrl);
  });

  it('deve chamar POST /api/receivables e emitir "created" quando o formulário é válido', () => {
    let emitted: Receivable | undefined;
    component.created.subscribe((r) => (emitted = r));

    component.form.setValue({
      type: ReceivableType.DUPLICATA_MERCANTIL,
      faceValue: 100000,
      termMonths: 3,
      paymentCurrency: Currency.BRL,
      cedente: 'Fábrica XYZ',
      sacado: 'Loja ABC',
    });

    component.submit();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.faceValue).toBe(100000);

    const mockResponse: Receivable = {
      id: 1,
      type: ReceivableType.DUPLICATA_MERCANTIL,
      faceValue: 100000,
      termMonths: 3,
      paymentCurrency: Currency.BRL,
      cedente: 'Fábrica XYZ',
      sacado: 'Loja ABC',
      status: 'PENDING' as never,
      createdAt: new Date().toISOString(),
      version: 0,
    };
    req.flush(mockResponse);

    expect(emitted?.id).toBe(1);
    expect(component.successMessage()).toContain('#1');
    expect(component.loading()).toBe(false);
  });

  it('deve exibir a mensagem de erro retornada pelo backend em caso de falha', () => {
    component.form.setValue({
      type: ReceivableType.DUPLICATA_MERCANTIL,
      faceValue: 100000,
      termMonths: 3,
      paymentCurrency: Currency.BRL,
      cedente: 'Fábrica XYZ',
      sacado: 'Loja ABC',
    });

    component.submit();

    const req = httpMock.expectOne(apiUrl);
    req.flush(
      {
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'Payload inválido: faceValue deve ser positivo',
      },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(component.errorMessage()).toContain('Payload inválido');
    expect(component.loading()).toBe(false);
  });
});
