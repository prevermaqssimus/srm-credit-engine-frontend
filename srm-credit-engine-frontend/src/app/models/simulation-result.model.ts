import { Currency } from './enums';

/** Espelha com.srm.creditengine.dto.SimulationResult (backend). Nunca persistido. */
export interface SimulationResult {
  presentValueBrl: number;
  discountBrl: number;
  finalAmount: number;
  currency: Currency;
  fxRateUsed: number | null;
}
