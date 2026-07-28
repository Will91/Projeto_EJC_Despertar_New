# EJC Despertar — Nova Plataforma

Reescrita completa do sistema legado (PHP procedural + WordPress + script
financeiro de terceiros) em uma plataforma única, moderna e segura.
Histórico completo da decisão em `/docs` (Etapas 1 a 4).

## Stack
- **API:** NestJS + Prisma + PostgreSQL (`/apps/api`)
- **Front-end:** Next.js 14 (App Router) + TypeScript + Tailwind (`/apps/web`)

## Como rodar a API localmente

```bash
cd apps/api
cp .env.example .env        # ajuste os segredos antes de usar em produção
npm install
docker compose up -d db     # sobe só o Postgres (a partir da raiz do repo)
npx prisma migrate dev      # cria as tabelas
npm run prisma:seed         # popula dados de teste (Etapa 4)
npm run start:dev
```

A API sobe em `http://localhost:3333/api/v1`.

Usuário de teste criado pelo seed:
- **e-mail:** admin@ejcdespertar.org.br
- **senha:** TrocarAntesDeUsar#2026 (troque antes de qualquer uso real)

## Rodar tudo via Docker

```bash
docker compose up --build
```

## Testes

```bash
cd apps/api
npm run test:e2e
```

## Como rodar o front-end (Next.js)

```bash
cd apps/web
cp .env.local.example .env.local   # aponta para a API local
npm install
npm run dev
```

O site sobe em `http://localhost:3000`.
- `/` — home institucional pública (SSR/ISR, substitui o WordPress)
- `/cadastro` — ficha de inscrição do encontrista (pública)
- `/login` — acesso ao portal
- `/portal/inscricoes`, `/portal/institucional`, `/portal/financeiro` — área logada (protegida por `middleware.ts`)

## Módulos implementados (Etapa 5 — completa)
- `iam` — registro, login, refresh token (rotacionado), logout, RBAC, confirmação de e-mail, recuperação de senha
- `pessoas` — perfil unificado do participante (com validação de responsável para menores de idade)
- `encontros` — encontros, círculos, casais, inscrições, confirmação por etapas, check-in por QR Code
- `institucional` — notícias, álbuns/fotos, agenda, slides, contato (substitui o WordPress)
- `comunicacao` — mural de avisos, notificações
- `biblioteca` — documentos, fotos, vídeos, orações, músicas, formações (recursos)
- `financeiro` — categorias, transações (entradas/saídas em centavos), saldo
- `admin` — dashboard, log de auditoria, exportação de inscritos em Excel e PDF
- `email` — abstração SMTP para confirmação de e-mail e recuperação de senha
- `uploads` — upload de arquivos (foto de perfil, capa de notícia etc.)
- `formacoes` — ficha simplificada para **equipeiros** se inscreverem em formações (nome, e-mail, idade, último encontro trabalhado, última equipe)

## Telas implementadas (Etapa 6)
Home pública, ficha de inscrição, login, painel de inscrições (com filtros,
confirmação e exportação), círculos & casais, CMS institucional (notícias),
mural de comunicação, biblioteca e financeiro — espelhando o protótipo da
Etapa 3 com os mesmos tokens de design.

## Documentação
Todo o histórico de decisões técnicas está em `/docs` (Etapas 1 a 9):
análise do legado, arquitetura, protótipo, modelagem de dados, testes,
deploy e documentação final de handover. Comece por
`docs/09-documentacao-final.md` para um mapa geral do projeto.

Com a API rodando, a documentação interativa (Swagger) fica disponível em
`http://localhost:3333/api/docs`.

## CI
Todo push roda testes automaticamente — ver `.github/workflows/ci.yml`.

## Status
Todas as lacunas da Etapa 9 foram fechadas nesta rodada, exceto WhatsApp
(motivo explicado em `docs/10-nota-whatsapp.md` — depende de credenciais
que só existem depois que o grupo abre a conta comercial):
- ✅ Confirmação de e-mail e recuperação de senha (módulo `email`, SMTP configurável, cai em modo "dry run" sem configuração)
- ✅ Upload de arquivos (`/uploads`, com abstração pronta para trocar por S3 em produção)
- ✅ Autocomplete de busca de pessoa nas telas de Círculos & Casais
- ✅ Validação obrigatória de dados de responsável para encontristas menores de idade
