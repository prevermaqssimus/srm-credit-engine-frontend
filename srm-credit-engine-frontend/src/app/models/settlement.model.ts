import { Currency } from './enums';

/**
 * Espelha o retorno de POST /api/settlements e GET /api/settlements/{id}.
 * Campos conferidos contra as respostas reais testadas via Postman
 * (ver SrmCredit_Engine_Instrucoes_.txt).
 */
export interface Settlement {
  id: number;
  receivableId: number;
  faceValue: number;
  presentValueBrl: number;
  discountBrl: number;
  finalAmount: number;
  settlementCurrency: Currency;
  fxRateUsed: number | null; // null quando settlementCurrency === BRL (moeda nativa, sem conversao)
  spreadApplied: number;
  baseRateApplied: number;
  idempotencyKey: string;
  cedente: string;
  providerUsed: string | null; // nome do provedor de cambio que respondeu; null quando fxRateUsed e null
  settledAt: string; // ISO-8601, imutavel apos a primeira liquidacao
}
