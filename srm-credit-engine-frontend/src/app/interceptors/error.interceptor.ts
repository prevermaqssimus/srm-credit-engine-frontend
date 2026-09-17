import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { extractApiErrorMessage } from '../services/api-error.util';

/**
 * Interceptor funcional (padrão moderno do Angular, registrado via
 * provideHttpClient(withInterceptors([...])) em app.config.ts).
 *
 * Passo 3 do plano: captura QUALQUER erro HTTP (400/404/409/422/500) num
 * único lugar, antes de ele chegar em qualquer componente -- decide aqui,
 * não espalhado em cada formulário.
 *
 * O que ele faz, hoje: extrai a mensagem amigável (reaproveitando
 * extractApiErrorMessage, já usada pelos componentes -- sem duplicar essa
 * lógica) e loga de forma estruturada no console, para visibilidade
 * durante o desenvolvimento (mesmo espírito dos logs estruturados do
 * backend). Depois disso, RE-LANÇA o mesmo erro (throwError) -- os
 * componentes continuam funcionando exatamente como antes, cada um
 * decidindo como exibir o erro na própria tela.
 *
 * O que ele NÃO faz (de propósito, por enquanto): não decide sozinho o
 * que mostrar na tela, nem substitui o tratamento de erro que já existe
 * em cada componente. Centralizar TAMBÉM a exibição (ex: um toast global,
 * sem cada componente ter seu próprio errorMessage) é uma evolução
 * possível, mas exigiria refatorar os componentes já existentes -- fora
 * do escopo deste passo.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const friendlyMessage = extractApiErrorMessage(error);

        // Log estruturado, único lugar que loga erro de API no frontend --
        // antes disso, cada componente logava (ou não) por conta própria.
        console.error('[api_error]', {
          url: req.url,
          method: req.method,
          status: error.status,
          message: friendlyMessage,
        });
      }

      // Sempre re-lança -- quem chamou o service continua recebendo o
      // erro normalmente, via seu próprio .subscribe({ error: ... }).
      return throwError(() => error);
    }),
  );
};
