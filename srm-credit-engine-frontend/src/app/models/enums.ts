/**
 * Espelha os enums do backend (com.srm.creditengine.domain.enums).
 * Qualquer valor novo adicionado no backend (ex.: EUR) precisa ser
 * replicado aqui manualmente -- não há geração automática de tipos
 * entre backend e frontend neste escopo.
 */

export enum Currency {
  BRL = 'BRL',
  USD = 'USD',
}

export enum ReceivableType {
  DUPLICATA_MERCANTIL = 'DUPLICATA_MERCANTIL',
  CHEQUE_PRE_DATADO = 'CHEQUE_PRE_DATADO',
}

export enum ReceivableStatus {
  PENDING = 'PENDING',
  SETTLED = 'SETTLED',
}
