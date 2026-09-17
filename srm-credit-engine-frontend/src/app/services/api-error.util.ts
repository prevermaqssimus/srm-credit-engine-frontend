import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error.model';

/**
 * Extrai a mensagem amigável do corpo de erro que o
 * GlobalExceptionHandler (backend) sempre retorna, no formato ApiErrorBody.
 * Se o corpo não vier nesse formato (ex: erro de rede, backend fora do ar),
 * cai num fallback genérico.
 */
export function extractApiErrorMessage(error: HttpErrorResponse): string {
  const body = error.error as Partial<ApiError> | undefined;
  if (body && typeof body.message === 'string') {
    return body.message;
  }
  if (error.status === 0) {
    return 'Não foi possível conectar à API. Verifique se o backend está rodando em ' + error.url;
  }
  return `Erro inesperado (HTTP ${error.status}).`;
}

/** Gera uma chave de idempotência única por tentativa de liquidação. */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
