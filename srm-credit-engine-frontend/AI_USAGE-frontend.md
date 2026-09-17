Eu utilizo as solicitações à IA de forma fragmentada. Usar scripts ou repositórios inteiros para consulta tende a gerar um resultado maior, porém com mais falhas. Prefiro pedir informações pontuais, derivadas de tarefas e entendimentos fragmentados — é mais fácil de absorver a informação assim.

Por exemplo, no escopo de atuação do frontend, pedi um passo a passo baseado no código já construído no backend, levando em consideração os pontos que deveríamos respeitar conforme o desafio técnico. Sigo esses passos para construir o sistema como um todo, mantendo rastreabilidade e sem perder o controle do que está sendo construído.

Escopo que vou seguir para essa construção

Plano Revisado — Frontend, 9 Passos

Passo 1 — Estrutura do projeto (scaffold)

Sem alteração. Resultado esperado: npm install + npm start funcionando, tela em branco.

Passo 2 — Models (contratos de dados)

Ajuste: adicionar api-error.model.ts já tipando os formatos de erro reais do backend (400, 404, 409, 422) — não um modelo genérico, mas refletindo a estrutura que o GlobalExceptionHandler do backend realmente devolve.
Resultado esperado: tipos compilando, incluindo os 4 formatos de erro mapeados.

Passo 3 — Services + interceptor de erro (NOVO — estava faltando)

O quê: receivable.service.ts, settlement.service.ts, error.interceptor.ts (novo).
Por que juntar agora: um interceptor HTTP centralizado captura 409/422/404 antes de qualquer componente precisar tratar isso individualmente — decide aqui, não depois espalhado em cada formulário.
Resultado esperado: services compilando + interceptor registrado no app.config.ts, testável isoladamente forçando um erro simulado.

Passo 4 — Componente de listagem de recebíveis

Sem alteração relevante. Resultado esperado: lista aparece (mesmo vazia).

Passo 5 — Componente de cadastro + simulação em tempo real


Ajuste: já incorpora explicitamente o que o FRONTEND_FLOW.md descreveu na Seção 3 — debounce de 300ms chamando /simulate dentro do próprio componente, isolado do pai.
Resultado esperado: cadastro funciona E a prévia de simulação aparece a cada campo alterado, sem fechar nada.

Passo 6 — Grid de liquidações com paginação + filtros (endpoint já confirmado no backend)

O quê: settlement-list.component.ts, com os 4 gatilhos descritos na Seção 8 do FRONTEND_FLOW.md (abertura, filtro com debounce 400ms, paginação, limpar filtros) — todos convergindo no método load() único.
Atualização: GET /api/settlements já existe no backend, com filtro por cedente/currency/startDate/endDate e paginação (page/size) — confirmado via API_TESTING.md e coleção Postman. O passo deixou de ser incerto: agora é consumir o endpoint já pronto, não construir do zero.
Por que como passo separado: é complexo o suficiente (4 gatilhos, sincronização filtro+página) para merecer seu próprio marco de verificação, antes de entrar no fluxo de liquidação.
Resultado esperado: grid carrega sozinha ao abrir a tela; os 4 gatilhos testados manualmente, um por um.

Passo 7 — Modal de liquidação: idempotencyKey + loading state (ajustado)

O quê: settlement-form.component.ts, com dois pontos que eu tinha sinalizado como pendentes, agora resolvidos aqui explicitamente:

idempotencyKey gerada uma única vez, no momento em que o modal abre (ex.: crypto.randomUUID() no ngOnInit do form ou ao setar selectedForSettlement) — reaproveitada em qualquer retry dentro da mesma sessão do modal, nunca gerada de novo a cada clique.
Botão "Confirmar" desabilitado enquanto a requisição está em voo (isSubmitting signal), prevenindo duplo clique físico.
Resultado esperado: liquidar funciona; testar manualmente clicando "Confirmar" duas vezes rápido — deve gerar uma liquidação, não duas, e o botão deve ficar visualmente desabilitado no meio do processo.

Passo 8 — Integração final: modais + AppComponent (era o Passo 7 original)

O quê: toda a orquestração da Seção 4-6 do FRONTEND_FLOW.md — showCreateModal, showSettleModal, showReceivablesPanel, @ViewChild para recarregar a Grid.
Decisão a registrar no DECISIONS.md: uso de @ViewChild em vez de Signal Store/NgRx — escolha consciente de simplicidade para o escopo do case, mesma lógica das trocas já documentadas no backend.
Resultado esperado: fluxo completo — cadastrar → ver na lista → liquidar → resultado aparece → Grid principal recarrega sozinha.

Passo 9 — Testes (Jasmine/Karma) — NOVO, fecha a lacuna já identificada

O quê: ao menos os services (Passo 3) e o interceptor de erro testados com HttpClientTestingModule; um teste do debounce de simulação (Passo 5); um teste confirmando que dois cliques rápidos em "Confirmar" (Passo 7) não disparam duas chamadas HTTP.
Por que não pular: sem isso, DECISIONS.md precisaria registrar "frontend sem testes automatizados" como corte consciente — o que é uma opção válida, mas pior do que simplesmente cobrir o mínimo crítico (idempotência client-side é exatamente o tipo de coisa que vale um teste automatizado, dado que já causou confusão real nos testes manuais do backend).