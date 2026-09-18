/**
 * Espelha o formato de org.springframework.data.domain.Page (Spring Data),
 * retornado por GET /api/settlements (extrato analítico). Genérico -- pode
 * ser reaproveitado para qualquer outro endpoint paginado no futuro.
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página atual, começando em 0
  size: number;
  first: boolean;
  last: boolean;
}

/** Filtros aceitos por GET /api/settlements -- todos opcionais e combináveis. */
export interface SettlementExtratoFilter {
  cedente?: string;
  currency?: string;
  startDate?: string; // ISO-8601
  endDate?: string; // ISO-8601
  page?: number;
  size?: number;
}
