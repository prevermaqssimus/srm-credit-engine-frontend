# SRM Credit Engine — Frontend

Painel do operador da plataforma de cessão de crédito multimoedas. Angular standalone, consumindo a API do backend (repositório separado: `srm-credit-engine`).

---

## Pré-requisitos — verifique antes de começar

Abra um terminal (VS Code, IntelliJ, ou o terminal do seu sistema operacional) **dentro da pasta do projeto** (`srm-credit-engine-frontend`) e rode os comandos abaixo, um de cada vez.

### 1. Node.js e npm

```bash
node -v
npm -v
```

Precisa de **Node.js 20 ou superior**. Se o comando não for reconhecido, ou a versão vier menor que 20:

📥 Baixe em: https://nodejs.org/ (instale a versão **LTS**)

Depois de instalar, feche e abra o terminal de novo, e rode `node -v` outra vez para confirmar.

### 2. Angular CLI

```bash
ng version
```

Se não for reconhecido:

```bash
npm install -g @angular/cli
```

### 3. Docker (necessário para rodar o backend)

```bash
docker -v
docker compose version
```

Se não estiver instalado:

📥 Baixe em: https://www.docker.com/products/docker-desktop/

Depois de instalar, abra o Docker Desktop e espere ele ficar com o ícone "rodando" (verde) antes de continuar.

---

## Passo a passo para rodar tudo

### 1. Instalar as dependências do frontend

Dentro da pasta `srm-credit-engine-frontend`:

```bash
npm install
```

Isso pode levar alguns minutos na primeira vez. Se aparecer algum erro vermelho (não *warning* amarelo, que é normal), pare e resolva antes de continuar.

### 2. Subir o backend

Em outra pasta, `srm-credit-engine` (o repositório do backend):

```bash
docker compose up
```

Aguarde até aparecer no log algo como `Started SrmCreditEngineApplication` — isso confirma que a aplicação Spring Boot subiu dentro do container.

**Confirme que o backend está de pé**, abrindo no navegador:
```
http://localhost:8080/actuator/health
```
Deve responder `{"status":"UP"}`. Se der erro de conexão, o backend ainda não subiu — espere mais um pouco ou revise o log do `docker compose up`.

### 3. Subir o frontend

De volta na pasta `srm-credit-engine-frontend`:

```bash
npm start
```

Abre em `http://localhost:4200`.

### 4. Confirmar que os dois estão se falando

Com as duas aplicações no ar, abra `http://localhost:4200` no navegador e veja se a lista de recebíveis carrega (mesmo vazia, sem erro no console). Se aparecer erro de CORS ou "Failed to fetch" no console (F12), o backend não está acessível a partir do frontend — revise a porta em `src/environments/environment.ts`.

---

## Resumo rápido (se já tiver tudo instalado)

```bash
# Terminal 1 — dentro de srm-credit-engine (backend)
docker compose up

# Terminal 2 — dentro de srm-credit-engine-frontend
npm install
npm start
```

---

## Estrutura do projeto

```
src/app/
├── models/         → contratos de dados (espelham as entidades/DTOs do backend)
├── services/        → comunicação HTTP com a API
├── interceptors/     → tratamento centralizado de erro (ver DECISIONS.md)
└── ...
src/environments/
└── environment.ts    → apiBaseUrl, único lugar que aponta pro backend
```

---

## Status atual da implementação

Este projeto está sendo construído em passos, cada um com uma entrega verificável antes do próximo (mesma lógica usada no backend). Ver `DECISIONS.md` para lacunas e cortes conhecidos.

- [x] Passo 1 — Scaffold do projeto
- [x] Passo 2 — Models
- [ ] Passo 3 — Services + interceptor de erro (em andamento)
- [ ] Passo 4 — Listagem de recebíveis
- [ ] Passo 5 — Cadastro + simulação em tempo real
- [ ] Passo 6 — Grid de liquidações (**bloqueado**, ver DECISIONS.md item 1)
- [ ] Passo 7 — Modal de liquidação (idempotência + loading)
- [ ] Passo 8 — Integração final
- [ ] Passo 9 — Testes (Jasmine/Karma)

---

## Backend

Repositório separado: `srm-credit-engine`. Precisa estar rodando antes deste frontend, na porta configurada em `environment.ts`.
