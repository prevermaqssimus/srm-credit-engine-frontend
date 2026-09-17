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