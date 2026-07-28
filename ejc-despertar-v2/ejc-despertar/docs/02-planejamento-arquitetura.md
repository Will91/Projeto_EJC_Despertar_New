# Etapa 2 — Planejamento da Nova Arquitetura
## Sistema EJC Despertar

> Aguardando aprovação para avançar à Etapa 3 (Protótipo das telas).

Decisões confirmadas por você e já incorporadas neste plano:
- ✅ **Financeiro:** não migrar o script de terceiros — construir um módulo financeiro **próprio, nativo e enxuto** dentro da nova plataforma (mais simples que reescrever o antigo, e já nasce integrado ao RBAC e à trilha de auditoria).
- ✅ **Site institucional:** o WordPress (`administrativoejc/`) será **absorvido**. A nova aplicação Next.js passa a servir também o site público — WordPress deixa de existir, eliminando de vez a maior superfície de ataque do projeto (WP core + plugins + temas desatualizados).
- ✅ **Banco de dados:** sem dump disponível — vou **modelar um schema novo do zero** (Etapa 4), usando como referência os nomes de tabelas e campos que a própria lógica legada revela (ex.: `tbl_usuarios`, `tbl_encontro`, `tbl_membros`, `tbl_encontrista`, além de casais e círculos), para não perder nenhum conceito de negócio. Você poderá popular com dados de teste (seed) para validar.

---

## 1. Do "3 sistemas" para "1 plataforma"

A descoberta da Etapa 1 (WordPress + CMS caseiro + sistema de inscrições + financeiro isolado) definiu a decisão mais importante da arquitetura: **consolidação**. A nova plataforma passa a ter **um único backend, um único banco, um único deploy**, organizado em módulos internos (bounded contexts) em vez de aplicações soltas:

| Módulo | Substitui | Resumo |
|---|---|---|
| **IAM** (Identidade e Acesso) | login.php espalhados + `tbl_usuarios` | Login, cadastro, recuperação de senha, confirmação por e-mail, RBAC (papéis: Admin, Coordenação, Secretaria, Tesouraria, Equipe) |
| **Institucional (CMS)** | WordPress + `admin/noticia.php`, `album.php`, `agenda.php`, `slide.php`, `video.php`, `contatos.php` | Notícias, galeria de fotos, agenda pública, slides da home, vídeos, contatos — gerenciável pelo mesmo painel admin |
| **Encontros & Inscrições** | `sistemaejc/SistemaDespertar/*` (o coração do sistema) | Cadastro de encontros, inscrição de encontristas, atrelamento de casais/padrinhos, círculos, confirmação por etapa (1º dia, 2º dia, cartas), check-in com QR Code, exportação PDF/Excel |
| **Perfil / Pessoas** | Dados espalhados em `tbl_membros` | Cadastro unificado de participante (foto, nome, apelido, nascimento, telefone, e-mail, endereço, equipe, encontros que participou, função, histórico, observações) — pedido explícito no seu briefing |
| **Comunicação** | — (não existia de forma estruturada) | Mural/avisos, notificações in-app, envio de e-mail, integração WhatsApp (quando possível) |
| **Biblioteca** | — (não existia) | Documentos, fotos, vídeos, orações, músicas, formações para download |
| **Financeiro (novo)** | script de terceiros isolado | Doações, caixa, eventos, prestação de contas, relatórios, auditoria — nativo, simples, sem dependência externa |
| **Admin / Auditoria** | painéis soltos | Dashboard, logs (quem alterou o quê, quando, IP), relatórios, gestão de usuários |

Cada módulo vira, no NestJS, um conjunto próprio de `controller` + `service` + `repository` + `dto` — isolado o suficiente para ser testado e evoluído sem quebrar os outros, mas compartilhando a mesma infraestrutura (auth, banco, logging).

---

## 2. Por que essa arquitetura é superior à atual

| Problema atual (Etapa 1) | Como a nova arquitetura resolve |
|---|---|
| `mysql_*` removido do PHP — código não roda em servidor atual | Prisma + PostgreSQL, com migrations versionadas |
| SQL Injection (queries concatenadas) | Prisma parametriza tudo por padrão — injection deixa de ser uma classe de bug possível |
| MD5 sem salt | bcrypt/Argon2 via biblioteca madura, com JWT + refresh token |
| Sem RBAC | RBAC de primeira classe, obrigatório em toda rota sensível (guards do NestJS) |
| 3 sistemas soltos, sem padrão comum | 1 backend, 1 schema de banco, 1 pipeline de deploy |
| Sem testes | Estrutura preparada para testes unitários e de integração desde o dia 1 (Jest) |
| Sem Git/CI/CD, deploy via FTP | Git + Docker + deploy em Vercel/Railway/Render/VPS, com ambientes (dev/staging/prod) |
| Credenciais no código-fonte | Variáveis de ambiente (`.env`), nunca commitadas |
| HTML+lógica+dados misturados no mesmo arquivo `.php` | Clean Architecture: Controller → Service → Repository, com DTOs validados por Zod |
| WordPress desatualizado como superfície de ataque extra | Eliminado — site institucional passa a ser páginas Next.js normais, com conteúdo vindo do mesmo backend/DB |

---

## 3. Stack (confirmando o que você propôs, sem alterações)

**Front-end:** React + Next.js + TypeScript + Tailwind + Shadcn/UI + Framer Motion + React Hook Form + Zod
**Back-end:** Node.js + NestJS + Prisma + PostgreSQL
**Auth:** JWT + Refresh Token + bcrypt/Argon2 + RBAC
**Infra:** Docker + Docker Compose, preparado para Vercel (front) / Railway ou Render ou VPS (back + banco)

Um adendo técnico: como o Next.js vai servir tanto o **site institucional público** (SEO-sensível: notícias, agenda, sobre) quanto o **portal logado** (inscrições, painel admin), vou usar:
- **Server-side rendering / ISR** para as páginas institucionais públicas (bom para SEO, que está no seu briefing);
- **Client-side + React Query (ou similar)** para as telas autenticadas do portal/admin, que não precisam de SEO mas precisam de interatividade.

---

## 4. Estrutura de pastas proposta (monorepo)

```
/ejc-despertar
  /apps
    /web              → Next.js (site institucional + portal + admin, um único app com áreas públicas e privadas)
    /api              → NestJS
      /src
        /modules
          /iam
          /institucional
          /encontros
          /pessoas
          /comunicacao
          /biblioteca
          /financeiro
          /admin
        /common        → guards, interceptors, filters, decorators globais
        /config
      /prisma
        schema.prisma
        /migrations
        seed.ts
      /test
  /packages
    /shared-types      → tipos TS compartilhados entre web e api (contratos de DTO)
    /ui                → componentes compartilhados (se necessário)
  docker-compose.yml
  .env.example
  /docs                → este material de análise/planejamento (versionado junto do código)
```

Cada módulo dentro de `/api/src/modules/<nome>` segue o mesmo esqueleto:
```
/encontros
  encontros.controller.ts
  encontros.service.ts
  encontros.repository.ts
  /dto
    create-encontro.dto.ts
    update-encontro.dto.ts
  encontros.module.ts
```

---

## 5. O que NÃO muda (funcionalidades preservadas)

Confirmando a regra que você definiu ("nunca remover funcionalidade sem justificar"): todo o levantamento da Etapa 1 — inscrição de encontristas, atrelamento de casais, círculos, confirmação por etapas (1º dia/2º dia/cartas), exportação de PDF/Excel, CMS institucional (notícias/álbuns/agenda/slides/vídeos/contatos) — está mapeado para um módulo correspondente na tabela da seção 1. Nada foi descartado; o financeiro é a única peça **substituída por decisão sua**, não removida sem critério.

---

## Próximo passo

Com a arquitetura aprovada, a **Etapa 3** será o **protótipo das telas** (wireframes/mockups de baixa fidelidade das principais jornadas: login, cadastro de encontrista, painel de inscrições, admin do CMS institucional, financeiro). Quer que eu já siga para isso, ou prefere ajustar algo neste planejamento antes?
