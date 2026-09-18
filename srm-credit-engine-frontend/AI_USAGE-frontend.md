# AI_USAGE.md — Frontend

Aqui documento como usei IA (Claude) neste repositório. Não é o log inteiro da conversa — só os pontos que mostram como decidi, o que a IA errou e como eu peguei, e o que fiz questão de não delegar.

---

## 1. Specs/prompts estratégicos

### Exemplo: passo a passo de setup do README

O que eu pedi, com a digitação corrigida (mantendo a mesma estrutura e ordem de ideias que escrevi originalmente):

> "Vamos iniciar pelo README necessário. Utilizar VS Code ou ferramenta similar, rodar dentro da pasta os comandos. Verificar, uma por uma, se as ferramentas necessárias já estão instaladas (rodando `npm -v` para o npm, e o mesmo para as demais) — se alguma não estiver instalada, colocar o link para baixar. Depois de confirmar tudo instalado, rodar `npm install`, `npm start`. Após isso, verificar se o Docker está configurado e se a aplicação do backend subiu corretamente na porta 8080, ou se o IntelliJ ou ferramenta similar está rodando o backend nessa mesma porta, para poder ter a experiência de teste completa."

O que eu queria com isso: um README que não assume que quem for rodar já tem tudo instalado — queria que checasse Node/npm, Angular CLI e Docker um por um, desse o link de download se não tivesse, e só depois desse a sequência de comandos pra subir backend e frontend juntos.

A IA entendeu a intenção certa mesmo com a frase truncada, e gerou a seção "Pré-requisitos" do README com os comandos de verificação (`node -v`, `ng version`, `docker -v`) + links de download + o passo a passo completo terminando numa checagem de `/actuator/health` pra confirmar que os dois lados estão se falando.

---

## 2. Um caso concreto em que a IA errou

**O que aconteceu:** ao criar `api-error.model.ts` (Passo 2), a IA assumiu que o backend retornava erro no formato RFC 7807/`ProblemDetail` (padrão comum do Spring), com campos `title`, `detail`, `instance`. Eu disse pra ela não perder tempo adivinhando e mandei o `GlobalExceptionHandler.java` real.

**Como percebi que tava errado:** o formato real do backend é bem mais simples — `timestamp`, `status`, `error`, `message`. Só descobri porque pedi pra IA olhar o código de verdade em vez de continuar assumindo.

**Outro caso parecido, mais sério:** eu tinha registrado no `DECISIONS.md` que `GET /api/settlements` (listagem/extrato) não existia no backend — e baseado nisso, a IA ia me fazer pausar o desenvolvimento do frontend pra implementar esse endpoint. Só que eu tinha mandado uma versão desatualizada do código-fonte antes. Quando mandei os documentos atualizados (Postman collection, API_TESTING.md), ficou claro que o endpoint já existia, com filtro e paginação prontos. Se eu não tivesse resubido a versão certa, teria perdido tempo "resolvendo" um problema que não existia mais.

**Como isso mudou meu processo:** parei de deixar a IA assumir formato de resposta de API sem eu mandar o código-fonte real primeiro — vale tanto pra erro (ApiError) quanto pra endpoint que eu achava que não existia.

---

## 3. O que decidi não delegar

- **A decisão de qual mensagem de erro mostrar pro operador em cada status HTTP** — a IA sugeriu diferenciar as 3 causas de 409 por texto, mas fui eu que decidi que só valia a pena diferenciar "recebível já liquidado" (que é exceção minha, com texto estável) e deixar as outras duas genéricas, porque são exceção do próprio Spring e o texto pode mudar de versão. A IA implementou depois que eu decidi isso.
- **Se rodava o frontend com Docker ou não** — a IA me mostrou os dois caminhos e o trabalho extra que o Docker no frontend daria (Dockerfile multi-stage, runtime config), mas a escolha de ficar só com `npm start` foi minha.
- **Toda decisão registrada no `DECISIONS.md`** — a IA propõe o texto, mas a escolha em si (o quê cortar, o quê manter) é sempre minha antes de virar documento.
