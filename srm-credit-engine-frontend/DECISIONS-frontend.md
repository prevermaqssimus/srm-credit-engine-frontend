Frontend não dockerizado — rodar via npm

Pensei em usar um único docker-compose (backend + banco + frontend), mas isso aumenta a complexidade do projeto sem necessidade agora. O motivo real não é "dá trabalho" — é que, nesta fase, o que importa é provar que o sistema funciona e manter o repositório limpo e fácil de entender, com uma história simples de acompanhar. Dockerizar o frontend agora significaria:

criar um Dockerfile próprio pro Angular (build + servir os arquivos estáticos via Nginx);
resolver que a URL da API fica "presa" dentro do build do Angular (diferente do Spring, que lê isso em runtime) — precisaria de uma configuração extra (runtime config lido via fetch) só pra isso funcionar direito.

Isso é complexidade de infraestrutura que não ajuda a provar que o sistema funciona nem deixa o código mais claro pra quem for ler — só adiciona peças extras a manter.

Decisão: rodar o frontend com npm start, direto, sem Docker. O backend continua podendo rodar via docker-compose up normalmente — só o frontend fica de fora.

Por quê: dois terminais (backend no Docker, frontend com npm) já resolve o "como rodar" de forma simples, e mantém o repositório limpo — sem Dockerfile extra, sem configuração de runtime, sem mais uma peça pra explicar na defesa que não agrega nada ao que está sendo avaliado agora. Se fosse pra produção, aí sim faria sentido — mas isso é trabalho de um segundo momento, não de agora.

O que eu faria diferente em produção: Dockerfile multi-stage (build com node, serve com Nginx) + runtime config via arquivo config.json carregado no main.ts, pra não precisar rebuildar a imagem toda vez que a URL do backend mudar.

Frontend e backend em repositórios separados, não no mesmo

Optei por dois repositórios (srm-credit-engine pro backend, srm-credit-engine-frontend pro front) em vez de um monorepo com os dois juntos.

Por quê: stacks completamente diferentes (Java/Maven de um lado, Angular/npm do outro), cada um com seu próprio ciclo de build, dependências e versionamento. Misturar os dois no mesmo repositório significaria histórico de commit poluído (commit de frontend aparecendo junto com commit de backend sem relação nenhuma), .gitignore mais confuso (regras de Java e Node convivendo), e um PR de mudança só no frontend rodando CI do backend à toa (ou vice-versa), se não tiver cuidado extra de configurar CI condicional.

Repositório separado também deixa mais claro, pra quem for avaliar, que são dois entregáveis distintos, cada um se sustentando sozinho — mas não impede dois repositórios quando faz sentido pela natureza do projeto.

## Commits iniciais foram para main, não develop

Os primeiros commits deste repositório foram parar em `main` porque, até então, a branch padrão do GitHub ainda apontava para `main` — só depois eu corrigi essa configuração para `develop` (Settings → Branches → Default branch). Por isso, alguns commits iniciais aparecem em `main` quando deveriam ter ficado só em `develop`.

Mantenho esses commits como estão, sem reescrever o histórico — isso já aconteceu e não muda mais. A partir de agora, com a branch padrão corrigida, isso não vai mais se repetir: nenhum commit novo vai direto pra `main`.


## Passo 4 (listagem de recebíveis) trouxe junto peças de passos anteriores incompletos

Ao implementar o componente de listagem (Passo 4), descobri que dependências que deveriam já existir de passos anteriores não estavam completas na branch: `src/environments/` não existia, e `receivable.service.ts` (que eu havia classificado como parte do Passo 3) nunca chegou a ser criado — só o interceptor e o utilitário de erro foram.

**Decisão:** em vez de pausar o Passo 4 para reabrir e corrigir retroativamente o Passo 3 numa branch separada, completei as peças que faltavam (`environments/`, `receivable.service.ts`, os models de simulação) dentro do próprio commit do Passo 4, já que era exatamente este passo que precisava delas pela primeira vez.

**Por quê:** um commit que não compila, só para respeitar rigorosamente "um passo por commit", não conta uma história melhor — conta uma história quebrada. A rastreabilidade que importa aqui é "cada commit deixa o projeto num estado funcional e testável", não "cada commit toca só nos arquivos daquele passo nominal". Prefiro um commit um pouco mais amplo, mas que roda de ponta a ponta, a vários commits menores em que nenhum deles sozinho compila.

**O que eu faria diferente:** ter feito uma auditoria completa do scaffold (Passo 1) e dos services (Passo 3) antes de declará-los fechados, em vez de descobrir as lacunas só quando um passo posterior esbarrava nelas.

## Standalone components, sem NgModule

O projeto usa o modelo standalone do Angular (sem AppModule/NgModule) — cada componente declara direto no próprio imports o que ele usa, em vez de depender de um módulo central que junta tudo.

Por quê: é o padrão recomendado pelo próprio Angular desde a versão 17, e o ng new já gera o projeto assim por padrão — não foi uma escolha contra a corrente, foi seguir o caminho atual do framework. Também deixa mais simples de entender: pra saber o que um componente usa, basta olhar o imports dele, sem precisar caçar em um AppModule separado que lista tudo do projeto inteiro.


## Framework de testes é Vitest, não Jasmine/Karma

O plano original (Passo 9) previa testes com Jasmine/Karma, seguindo o que era o padrão histórico do Angular CLI. O CI acusou erro (toBeFalse() não existe, sugestão de toBeFalsy()) que revelou que o projeto real usa Vitest como test runner — mudança que o próprio ng new já traz por padrão em versões recentes do Angular.

Correção: trocado toBeFalse() (sintaxe Jasmine) por toBe(false) (Vitest) nos specs afetados. Toda menção futura a "Jasmine/Karma" no plano e nos passos deste projeto passa a ser Vitest.

Por quê o engano aconteceu: o plano foi escrito a partir de conhecimento geral sobre Angular, sem confirmar contra o package.json real do projeto antes — o mesmo tipo de suposição sem verificação que já causou os erros anteriores (ApiError no formato errado, endpoint "inexistente"). Reforça a mesma lição: checar a configuração real do projeto antes de escrever código ou documentação em cima de uma suposição.