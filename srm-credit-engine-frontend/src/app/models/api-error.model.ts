/**
 * Estrutura CONFIRMADA contra GlobalExceptionHandler.java (backend real).
 * Formato simples e customizado -- NÃO é RFC 7807/ProblemDetail.
 */
export interface ApiError {
  timestamp: string; // ISO-8601
  status: number; // 400 | 404 | 409 | 422 | 500
  error: string; // reason phrase HTTP, ex.: "Not Found", "Conflict"
  message: string; // mensagem específica -- é o campo que diferencia as 3 causas de 409 (ver nota abaixo)
}

/**
 * Códigos de status que o frontend precisa tratar de forma diferenciada.
 *
 * ATENÇÃO: 409 tem TRÊS causas distintas no backend, todas com o mesmo
 * status mas `message` diferente -- se for necessário exibir texto
 * específico por causa (não apenas um "409 genérico"), o interceptor
 * precisa inspecionar `message`, não só `status`:
 *   - ReceivableAlreadySettledException      -> "recebível já liquidado"
 *   - ObjectOptimisticLockingFailureException -> "modificado concorrentemente"
 *   - DataIntegrityViolationException         -> "conflito de integridade"
 *
 *   400 -- validação de payload OU IllegalArgumentException
 *   404 -- recebível/liquidação inexistente
 *   409 -- ver as três causas acima
 *   422 -- provedor de câmbio indisponível (SPEC.md Seção 5)
 *   500 -- erro não mapeado (fallback; logado com stacktrace no backend)
 */
export type HandledErrorStatus = 400 | 404 | 409 | 422 | 500;
