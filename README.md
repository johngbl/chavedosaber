# Escola Chave — Sistema de Pré-Matrícula Digital

Sistema de pré-matrícula digital desenvolvido como MVP para automatizar processos escolares e reduzir o consumo de papel, alinhado com o **ODS 12 (Consumo e Produção Responsáveis)** da ONU.

O sistema permite que encarregados de educação preencham a ficha de matrícula online, eliminando a necessidade de formulários em papel. A administração escolar gere as pré-matrículas através de um painel administrativo protegido, com capacidade de aprovar, rejeitar e gerar termos de assinatura para impressão.

> **Nota:** Este projeto **não contém** quaisquer funcionalidades financeiras ou de faturação.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Runtime** | Bun |
| **Backend** | ElysiaJS + Drizzle ORM + PostgreSQL |
| **Frontend** | React 19 + Tailwind CSS 4 + Vite |
| **Auth** | JWT em cookie `httpOnly` (`jose`) + `Bun.password` |
| **Linting** | Biome |
| **Base de Dados** | PostgreSQL 16 (Docker) |
| **Deploy** | Docker / Dokploy |

---

## Pré-requisitos

- [Bun](https://bun.sh/) >= 1.3
- [Docker](https://www.docker.com/) (para o PostgreSQL local)

---

## Configuração (desenvolvimento local)

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd EscolaChave
bun install
cd backend && bun install && cd ..
cd frontend && bun install && cd ..
```

### 2. Configurar as variáveis de ambiente

O arquivo `.env` fica na **raiz** do repositório (não em `backend/`):

```bash
cp .env.example .env
# edite .env — ao menos JWT_SECRET (32+ caracteres) e ADMIN_PASSWORD (12+ caracteres)
```

> ⚠️ **Segurança:** o backend recusa `JWT_SECRET` curto, `ADMIN_PASSWORD` fraca e falha no boot se `DATABASE_URL`/`JWT_SECRET` estiverem ausentes. **Nunca** use `admin123` como senha de administrador.

### 3. Subir o PostgreSQL e preparar o banco

```bash
bun run db:up        # sobe o container PostgreSQL 16 (credenciais do .env)
bun run db:push      # cria as tabelas + índices (Drizzle)
bun run seed         # cria o admin (leia a senha no seu .env)
```

> O seed é **idempotente** e **não imprime senhas**. Para redefinir a senha do admin existente: `bun run seed --force`.

### 4. Rodar em desenvolvimento

```bash
bun run dev
```

- **Frontend** — `http://localhost:5173`
- **Backend** — `http://localhost:3000` (health em `GET /`)

---

## Autenticação

- Login define um cookie **`httpOnly`** (`SameSite=Lax`, `Secure` em produção) — o token **nunca** fica no `localStorage` (proteção contra XSS).
- Sessão validada no boot do app via `GET /api/auth/me`.
- `GET /api/matriculas*` devolve `401` quando o token expira; o frontend redireciona para `/login`.
- Rate limit por IP com `TRUST_PROXY`: atrás do nginx do Dokploy use `TRUST_PROXY=true`; sem proxy o IP real vem do socket (impossível de forjar).

---

## API Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/auth/login` | Não | Login do administrador → cookie httpOnly + `{ nome }` |
| `GET` | `/api/auth/me` | Sim | Dados do usuário logado (valida a sessão) |
| `POST` | `/api/auth/logout` | Não | Encerra a sessão (expira o cookie) |
| `POST` | `/api/matriculas/links` | Sim | Gerar link temporário de matrícula (uso único, 30 dias) |
| `GET` | `/api/matriculas/links` | Sim | Listar links recentes com status (ativo/usado/expirado) |
| `GET` | `/api/matriculas/links/:token` | Não | Validar link ao abrir o formulário (não o consome) |
| `POST` | `/api/matriculas` | Não | Submeter pré-matrícula (exige `token` válido; uso único → 410 na reutilização) |
| `GET` | `/api/matriculas` | Sim | Listar paginado no SQL (`?page=1&limit=10&status=pendente`) |
| `GET` | `/api/matriculas/:id` | Sim | Detalhes de uma matrícula |
| `PATCH` | `/api/matriculas/:id/status` | Sim | Atualizar status (`pendente`, `aprovada`, `rejeitada`) |

### Validações de pré-matrícula (retornam `400`)

- **Data de nascimento:** deve existir no calendário e **não ser futura** (ex.: `2023-02-30` → 400, antes causava 500 do PostgreSQL).
- **CPF:** dígitos verificadores validados (aluno e responsável).
- **NIS:** 11 dígitos quando informado.
- **E-mail de contato:** formato válido (422 no schema).
- **RG do responsável:** ao menos 4 dígitos.

---

## Testes, lint e type-check

```bash
bun run test          # 62 testes (unit + e2e, DB mockado)
bun run typecheck     # tsc no backend + frontend (strict)
bun run lint          # Biome lint
bun run check         # Biome check (lint + format, sem --write destrutivo)
```

---

## Deploy em produção (Dokploy)

1. Envie o repositório para o git remoto (os `bun.lock` agora são versionados para builds reproduzíveis).
2. No Dokploy, crie um projeto **"Docker Compose"** apontando para `docker-compose.prod.yml`.
3. Configure as **variáveis de ambiente** no painel:

   | Variável | Exemplo | Obrigatória |
   |----------|---------|-------------|
   | `POSTGRES_USER` | `escolachave` | sim |
   | `POSTGRES_PASSWORD` | (gerada forte) | sim |
   | `POSTGRES_DB` | `escolachave` | sim |
   | `JWT_SECRET` | `openssl rand -hex 32` | sim |
   | `ADMIN_EMAIL` | `admin@escolachave.com` | sim |
   | `ADMIN_NAME` | `Administrador` | sim |
   | `ADMIN_PASSWORD` | (senha forte 12+) | sim |
   | `CORS_ORIGIN` | `https://app.seudominio.com` | sim |

   > O compose **falha rápido** se `POSTGRES_PASSWORD`, `JWT_SECRET` ou `ADMIN_PASSWORD` estiverem ausentes.

4. **Domínio (HTTPS):** no Dokploy, vá ao serviço `frontend` → **Domains** e adicione o seu domínio com a porta interna **3000**. O Traefik do Dokploy roteia `https://seudominio.com` → serviço frontend (porta interna **3000**), com certificado automático. O compose **não publica portas** de propósito — evita conflito com o Traefik (que já ocupa 80/443 do host).

5. **Deploy.** O backend sincroniza o schema automaticamente no boot (`drizzle-kit push`).

6. Crie o administrador uma única vez (terminal do Dokploy no serviço backend):

   ```bash
   docker compose --profile seed run --rm seed
   ```

7. O nginx do frontend faz proxy de `/api` para o backend (`BACKEND_HOST=backend`, porta interna **3000**) e repassa o `X-Forwarded-For` do Traefik — por isso o backend usa `TRUST_PROXY=true` no compose de produção.

> **Renovação de senha:** mude `ADMIN_PASSWORD` no painel e rode o seed com `--force` no container backend.

---

## Estrutura do Projeto

```
EscolaChave/
├── docker-compose.yml        # PostgreSQL (dev)
├── docker-compose.prod.yml   # Deploy Dokploy (postgres + backend + frontend + seed)
├── .env.example              # Template de variáveis (copie para .env)
├── package.json              # Scripts raiz
├── biome.json                # Lint/format (ignora dist/ e node_modules)
│
├── backend/
│   ├── Dockerfile
│   ├── drizzle.config.ts
│   └── src/
│       ├── index.ts          # Boot (PORT/HOST do env, CORS com credenciais)
│       ├── env.ts            # Validação fail-fast de variáveis
│       ├── seed.ts           # Cria admin (senha forte obrigatória, --force)
│       ├── db/
│       │   ├── schema.ts     # users + matriculas (com índices)
│       │   └── connection.ts
│       ├── middleware/
│       │   ├── auth.ts       # JWT via jose (verify + extração cookie/Bearer)
│       │   └── rateLimit.ts  # IP real do socket + TRUST_PROXY opt-in
│       ├── routes/
│       │   ├── auth.ts       # login (cookie) + /me + /logout
│       │   └── matriculas.ts # CRUD + validações + paginação SQL
│       └── utils/validations.ts  # CPF/NIS/data (aplicadas nas rotas)
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf            # SPA + proxy /api + headers de IP real
    ├── vite.config.ts
    	└── src/
    		├── App.tsx           # Router + ProtectedRoute
    		├── api/client.ts     # fetch com credentials, 401 → evento, 204
    		├── contexts/AuthContext.tsx  # sessão via /me, logout real
    		├── utils/validations.ts      # validações client-side
    		├── components/…      # Stepper, Steps, StatusBadge, PrintTermo
    		└── pages/…           # Landing, Matrícula (link), Login, Dashboard, Detalhe, 404
    ```

---

## Como Usar

### Fluxo do Encarregado de Educação (via link de convite)

1. A secretaria envia um **link de convite** (WhatsApp/e-mail). O link é **uso único** e válido por **30 dias**.
2. Ao abrir `/matricula/:token`, o link é validado; se estiver expirado, já utilizado ou inválido, o formulário não abre.
3. Preencher em 4 passos: **Dados do Aluno** → **Filiação e Contacto** → **Saúde e Deficiências** → **Responsável Legal** (com consentimento LGPD e autorização de imagem).
4. Submeter e aguardar a confirmação visual.

### Fluxo da Administração / Secretaria (Protegido)

1. Aceder `/login` e iniciar sessão.
2. **Gerar link de matrícula:** no painel, clique em **"+ Gerar link de matrícula"** e copie o link para enviar à família. A lista de links mostra o status (ativo/usado/expirado).
3. **Painel:** tabela de pré-matrículas com filtros por status (`pendente`/`aprovada`/`rejeitada`) e paginação.
4. **Detalhes:** aprovar/rejeitar e gerar o **Termo de Assinatura** (impressão A4 com cabeçalho oficial).

---

## Segurança

- Token JWT apenas em cookie `httpOnly` (nunca no `localStorage`).
- CORS com credenciais e origens explícitas (nunca `*`).
- Rate limit anti-brute-force no login sem spoofing de `x-forwarded-for`.
- Validação fail-fast de segredos no boot.
- Senha do admin exigida forte e nunca logada.
- Dados sensíveis de menores protegidos por autenticação (LGPD).

---

## Licença

Projeto privado — Escola Chave.
