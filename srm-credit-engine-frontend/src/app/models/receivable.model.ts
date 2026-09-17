import { Currency, SettlementStatus, ReceivableType } from './enums';


/**
 * Espelha o retorno de GET /api/receivables e GET /api/receivables/{id}.
 * Campos e nomes conferidos contra a entidade Receivable do backend.
 */
export interface Receivable {
  id: number;
  cedente: string;
  sacado: string;
  faceValue: number;
  paymentCurrency: Currency;
  termMonths: number;
  type: ReceivableType;
  status: SettlementStatus;
  createdAt: string; // ISO-8601 (Instant serializado pelo Jackson)
  version: number; // @Version -- optimistic locking, exposto para o cliente detectar conflito
}
