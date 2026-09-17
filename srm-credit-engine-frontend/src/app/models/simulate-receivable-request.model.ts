import { Currency, ReceivableType } from './enums';

/** Espelha com.srm.creditengine.dto.SimulateReceivableRequest (backend). */
export interface SimulateReceivableRequest {
  type: ReceivableType;
  faceValue: number;
  termMonths: number;
  paymentCurrency: Currency;
}
