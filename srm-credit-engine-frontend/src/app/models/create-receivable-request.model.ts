import { Currency, ReceivableType } from './enums';

/** Body de POST /api/receivables e de POST /api/receivables/simulate. */
export interface CreateReceivableRequest {
  cedente: string;
  sacado: string;
  faceValue: number;
  paymentCurrency: Currency;
  termMonths: number;
  type: ReceivableType;
}

/**
 * Resposta de POST /api/receivables/simulate -- prévia, sem persistir nada.
 * Estrutura menor que Settlement: não tem id, idempotencyKey nem settledAt,
 * porque nada foi de fato liquidado ainda.
 */
export interface SimulationResult {
  presentValueBrl: number;
  discountBrl: number;
  finalAmount: number;
  currency: Currency;
  fxRateUsed: number | null;
}
