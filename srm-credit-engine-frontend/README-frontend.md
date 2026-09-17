# Passo a Passo — Rodar o Projeto Completo

## Portas usadas

| Aplicação | Porta |
|---|---|
| Backend (Spring Boot) | **8080** |
| Frontend (Angular) | **4200** |

O **frontend só roda local** (`npm start`) — não é dockerizado (ver `DECISIONS-frontend.md`, seção "Frontend não dockerizado — rodar via npm mesmo"). O **backend pode rodar dos dois jeitos**: local (IntelliJ) ou via Docker. Escolha uma das duas opções abaixo para o backend.

---

# BACKEND

## Opção 1 — Rodar o backend local, pelo IntelliJ

1. Abra o projeto `srm-credit-engine` no IntelliJ.
2. Espere o Maven terminar de importar as dependências (barra de progresso no rodapé da IDE).
3. Localize a classe principal (`CreditEngineApplication.java`, a que tem `public static void main`).
4. Clique no ícone de play (▶) ao lado da classe, ou botão direito → **Run**.
5. Espere aparecer no console algo como `Started CreditEngineApplication` e a porta `8080`.

**Confirme que subiu**, abrindo no navegador:
```
http://localhost:8080/actuator/health
```
Deve aparecer: `{"status":"UP"}`

**Ou, alternativa mais completa:** abra o Swagger, que já mostra todos os endpoints disponíveis para testar direto pelo navegador:
```
http://localhost:8080/swagger-ui/index.html
```

---

## Opção 2 — Rodar o backend via Docker

1. Abra o VS Code (ou terminal do sistema).
2. Abra a pasta do backend: **File → Open Folder** → selecione `srm-credit-engine`.
3. Abra o terminal integrado: **Ctrl+J** (ou **Terminal → New Terminal** no menu).
4. Confirme que está na pasta certa (o terminal deve mostrar o caminho terminando em `srm-credit-engine`).
5. Rode:

```bash
docker compose up --build
```

**Na primeira vez**, o Docker baixa as imagens (PostgreSQL, etc.) e constrói a imagem do backend do zero — pode levar alguns minutos, é normal. Da próxima vez, se não tiver mudado nada no código, `docker compose up` (sem `--build`) já basta e sobe mais rápido.

6. Espere aparecer no log algo como `Started CreditEngineApplication`.

**Confirme que subiu**, abrindo no navegador:
```
http://localhost:8080/actuator/health
```
Deve aparecer: `{"status":"UP"}`

**Ou, alternativa mais completa:** abra o Swagger, que já mostra todos os endpoints disponíveis para testar direto pelo navegador:
```
http://localhost:8080/swagger-ui/index.html
```

---

# FRONTEND

O frontend só roda local, do mesmo jeito independente de como você subiu o backend acima.

## 1. Verificar ferramentas instaladas

Abra um terminal (VS Code, WebStorm, ou terminal do sistema) e rode, um de cada vez:

```bash
node -v
```
Precisa ser versão 20 ou superior. Se não reconhecer, baixe em: https://nodejs.org/ (versão LTS)

```bash
npm -v
```
Vem junto com o Node.

```bash
ng version
```
Se não reconhecer:
```bash
npm install -g @angular/cli
```

## 2. Instalar e subir

Dentro da pasta `srm-credit-engine-frontend`:

```bash
npm install
npm start
```

Abre sozinho em:
```
http://localhost:4200
```

---

# Confirmar que os dois estão se falando

Com o backend rodando (Opção 1 ou 2 acima) **e** o frontend rodando (`npm start`), acesse `http://localhost:4200` no navegador.

Se a tela carregar sem erro no console (F12 → aba Console), está tudo funcionando.

Se aparecer erro de conexão ou CORS: confirme que o backend ainda está no ar, e que `src/environments/environment.ts` do frontend aponta para `http://localhost:8080`.