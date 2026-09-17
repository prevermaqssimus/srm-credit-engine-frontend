import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateReceivableRequest } from '../models/create-receivable-request.model';
import { Receivable } from '../models/receivable.model';
import { SimulateReceivableRequest } from '../models/simulate-receivable-request.model';
import { SimulationResult } from '../models/simulation-result.model';

/**
 * Consome com.srm.creditengine.controller.ReceivableController.
 * Cada método aqui corresponde a exatamente um endpoint do backend --
 * nenhuma lógica de negócio (cálculo, validação de regra) vive aqui, só
 * a chamada HTTP em si (mesmo princípio de responsabilidade única do
 * lado do backend).
 */
@Injectable({ providedIn: 'root' })
export class ReceivableService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/receivables`;

  /** POST /api/receivables */
  create(request: CreateReceivableRequest): Observable<Receivable> {
    return this.http.post<Receivable>(this.baseUrl, request);
  }

  /** GET /api/receivables/{id} */
  getById(id: number): Observable<Receivable> {
    return this.http.get<Receivable>(`${this.baseUrl}/${id}`);
  }

  /** GET /api/receivables */
  listAll(): Observable<Receivable[]> {
    return this.http.get<Receivable[]>(this.baseUrl);
  }

  /**
   * POST /api/receivables/simulate -- nunca persiste nada, só calcula.
   * Usado pelo preview de valor líquido em tempo real (painel do
   * operador, com debounce no componente que chama isso).
   */
  simulate(request: SimulateReceivableRequest): Observable<SimulationResult> {
    return this.http.post<SimulationResult>(`${this.baseUrl}/simulate`, request);
  }
}
