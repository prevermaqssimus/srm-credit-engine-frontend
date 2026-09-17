import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Settlement } from '../models/settlement.model';
import { SettleRequest } from '../models/settle-request.model';
import { Page, SettlementExtratoFilter } from '../models/page.model';

/** Consome com.srm.creditengine.controller.SettlementController. */
@Injectable({ providedIn: 'root' })
export class SettlementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/settlements`;

  /** POST /api/settlements */
  settle(request: SettleRequest): Observable<Settlement> {
    return this.http.post<Settlement>(this.baseUrl, request);
  }

  /** GET /api/settlements/{id} */
  getById(id: number): Observable<Settlement> {
    return this.http.get<Settlement>(`${this.baseUrl}/${id}`);
  }

  /**
   * GET /api/settlements -- extrato analítico com filtros opcionais e
   * paginação SEMPRE server-side (nunca busca tudo e pagina no cliente).
   * Cada chamada de página/filtro novo dispara uma requisição nova.
   */
  extrato(filter: SettlementExtratoFilter): Observable<Page<Settlement>> {
    let params = new HttpParams()
      .set('page', filter.page ?? 0)
      .set('size', filter.size ?? 10);

    if (filter.cedente) {
      params = params.set('cedente', filter.cedente);
    }
    if (filter.currency) {
      params = params.set('currency', filter.currency);
    }
    if (filter.startDate) {
      params = params.set('startDate', filter.startDate);
    }
    if (filter.endDate) {
      params = params.set('endDate', filter.endDate);
    }

    return this.http.get<Page<Settlement>>(this.baseUrl, { params });
  }
}
