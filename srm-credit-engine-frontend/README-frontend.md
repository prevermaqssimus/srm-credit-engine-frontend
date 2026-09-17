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

**⚠️ Importante: o frontend precisa subir exatamente na porta 4200.** O backend está configurado com CORS liberado especificamente para `http://localhost:4200` (ver `CorsConfig.java`, no repositório do backend). Se a porta 4200 estiver ocupada (por outra instância do `ng serve` esquecida em outro terminal), o Angular vai perguntar se quer usar outra porta — **recuse e libere a 4200 primeiro**, senão o backend vai responder `403 Forbidden` em toda chamada, mesmo com o backend funcionando normalmente.

**Se a porta 4200 estiver ocupada**, descubra e feche o processo antes de rodar `npm start`:
```bash
netstat -ano | findstr :4200
taskkill /PID <numero_do_pid> /F
```

**Se você precisar mesmo rodar o frontend em outra porta**, tem duas opções, do lado do backend (`CorsConfig.java`):
- Trocar a porta liberada em `allowedOrigins("http://localhost:4200")` para a porta nova que você está usando.
- Ou trocar `allowedOrigins` por `allowedOriginPatterns("http://localhost:*")`, liberando qualquer porta local — mais conveniente, mas menos restritivo (aceita conexão de qualquer processo rodando localmente em qualquer porta, não só o seu frontend).

### 4. Confirmar que os dois estão se falando

Com as duas aplicações no ar, abra `http://localhost:4200` no navegador e veja se a lista de recebíveis carrega (mesmo vazia, sem erro no console). Se aparecer `403 Forbidden` ou erro de CORS no console (F12), revise a seção acima — provavelmente o frontend subiu em outra porta, diferente da liberada no `CorsConfig.java` do backend.

---

## Resumo rápido (se já tiver tudo instalado)

```bash
# Terminal 1 — dentro de srm-credit-engine (backend)
docker compose up

# Terminal 2 — dentro de srm-credit-engine-frontend
npm install
npm start

## Backend

Repositório separado: `srm-credit-engine`. Precisa estar rodando antes deste frontend, na porta configurada em `environment.ts`.