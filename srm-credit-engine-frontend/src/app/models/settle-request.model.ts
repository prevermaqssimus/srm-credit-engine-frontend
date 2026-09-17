import { Currency } from './enums';

/**
 * Body de POST /api/settlements.
 * idempotencyKey é gerada no frontend (crypto.randomUUID()) no momento em
 * que o modal de liquidação abre -- ver Passo 7 do plano -- nunca no
 * momento do clique em "Confirmar", para sobreviver a um retry manual
 * dentro da mesma sessão do modal.
 */
export interface SettleRequest {
  receivableId: number;
  currency: Currency;
  idempotencyKey: string;
}
