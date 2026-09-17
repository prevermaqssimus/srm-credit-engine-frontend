/**
 * Espelha com.srm.creditengine.domain.enums.ReceivableType (backend).
 * Os valores DEVEM ser exatamente iguais (case-sensitive) aos nomes do
 * enum Java -- o Jackson serializa/desserializa enums Java pelo nome.
 */
export enum ReceivableType {
  DUPLICATA_MERCANTIL = 'DUPLICATA_MERCANTIL',
  CHEQUE_PRE_DATADO = 'CHEQUE_PRE_DATADO',
}

export const RECEIVABLE_TYPE_LABELS: Record<ReceivableType, string> = {
  [ReceivableType.DUPLICATA_MERCANTIL]: 'Duplicata Mercantil (spread 1,5% a.m.)',
  [ReceivableType.CHEQUE_PRE_DATADO]: 'Cheque Pré-datado (spread 2,5% a.m.)',
};

/** Espelha com.srm.creditengine.domain.enums.Currency (backend). */
export enum Currency {
  BRL = 'BRL',
  USD = 'USD',
}

/** Espelha com.srm.creditengine.domain.enums.SettlementStatus (backend). */
export enum SettlementStatus {
  PENDING = 'PENDING',
  SETTLED = 'SETTLED',
}

export const SETTLEMENT_STATUS_LABELS: Record<SettlementStatus, string> = {
  [SettlementStatus.PENDING]: 'Pendente',
  [SettlementStatus.SETTLED]: 'Liquidado',
};
