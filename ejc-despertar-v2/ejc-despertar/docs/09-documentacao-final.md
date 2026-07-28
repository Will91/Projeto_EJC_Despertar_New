# Etapa 9 — Documentação Final
## Sistema EJC Despertar — Handover do Projeto

## 1. Resumo executivo

O sistema legado do EJC Despertar (PHP procedural sem framework, rodando em extensão do PHP removida desde 2015, com WordPress desatualizado e um script financeiro de terceiros isolado) foi reestruturado em uma **plataforma única**: API em NestJS + Prisma + PostgreSQL, front-end em Next.js, com autenticação segura (JWT + refresh token + RBAC), auditoria automática, e todos os módulos de negócio identificados nas Etapas 1 e 2.

Nenhuma funcionalidade do sistema original foi perdida — a tabela de rastreabilidade completa está na Etapa 4 (`docs/04-modelagem-banco-dados.md`).

## 2. Mapa do projeto

```
ejc-despertar/
├── docs/                        # todo o histórico de decisões (Etapas 1-9)
├── apps/
│   ├── api/                     # backend NestJS
│   │   ├── prisma/schema.prisma # modelo de dados completo
│   │   ├── prisma/seed.ts       # dados de teste
│   │   └── src/modules/         # iam, pessoas, encontros, institucional,
│   │                             comunicacao, biblioteca, financeiro, admin
│   └── web/                     # frontend Next.js
│       └── src/app/             # páginas públicas e do portal
├── .github/workflows/ci.yml     # pipeline de testes automáticos
├── docker-compose.yml
└── README.md                    # instruções de instalação/execução
```

## 3. Onde encontrar cada decisão técnica

| Dúvida | Documento |
|---|---|
| "Por que reescrever tudo?" | `docs/01-analise-codigo-legado.md` |
| "Por que essa stack e essa arquitetura?" | `docs/02-planejamento-arquitetura.md` |
| "Como as telas foram pensadas?" | `docs/03-prototipo-telas.html` (abrir no navegador) |
| "Como os dados estão organizados?" | `docs/04-modelagem-banco-dados.md` |
| "Que garantias de qualidade existem?" | `docs/07-testes.md` |
| "Como colocar no ar?" | `docs/08-deploy.md` |

## 4. Papéis de acesso (RBAC) — referência rápida

| Papel | Pode fazer |
|---|---|
| `ADMIN` | Tudo, incluindo apagar pessoas e gerenciar usuários |
| `COORDENACAO` | Gerencia encontros, círculos, casais, institucional, vê financeiro |
| `SECRETARIA` | Gerencia pessoas, inscrições, institucional |
| `TESOURARIA` | Gerencia transações financeiras |
| `EQUIPE` | Registra check-in e etapas de confirmação (1º dia, 2º dia, cartas) |
| `ENCONTRISTA` | Papel padrão de quem se cadastra publicamente; sem acesso ao portal administrativo |

Conceder um papel administrativo a alguém é uma ação que só um `ADMIN` pode fazer diretamente no banco (via Prisma Studio) ou por um endpoint futuro de gestão de usuários — **de propósito não existe rota pública para se autopromover a admin**, corrigindo a maior brecha de segurança do sistema legado.

## 5. O que fica como próximo passo (fora do escopo entregue)

Sendo transparente sobre os limites do que foi construído nesta sequência de etapas:

- **Envio de e-mail real** (confirmação de cadastro, recuperação de senha): a estrutura de auth já emite os tokens certos, mas falta integrar um provedor de e-mail (Resend, SendGrid, SES) — é a peça citada no briefing original ("Confirmação por e-mail") que ainda não tem implementação.
- **Integração com WhatsApp**: o briefing marcava isso como "quando possível" — não implementado nesta fase.
- **Upload de arquivos** (foto de perfil, fotos de álbum): os campos (`fotoUrl`, `arquivoUrl`) já existem no modelo de dados esperando uma URL; falta o serviço de upload em si (ex.: S3, Cloudinary, ou Vercel Blob).
- **Autocomplete de busca de pessoa** na tela de Círculos & Casais (front-end): hoje pede o ID diretamente; o endpoint de busca (`GET /pessoas?search=`) já existe na API, só falta o componente de UI.
- **Validação automática de "menor de idade" exigindo dados de responsável**: hoje é uma regra pensada no modelo de dados (Etapa 4), mas ainda não é obrigatória via código no backend.
- **Migração de dados reais**, caso um dump do banco legado apareça no futuro (temos o script combinado na Etapa 4 para isso).

## 6. Como pedir ajuda para continuar

Todo o código está comentado explicando o "porquê" das decisões (não só o "o quê"), e cada módulo segue exatamente o mesmo padrão (`controller` → `service` → `repository` → `dto`), então adicionar uma funcionalidade nova em qualquer área deve seguir o mesmo molde dos módulos já existentes — copiar a estrutura de `financeiro/` ou `biblioteca/` (os mais simples) é o caminho mais rápido para entender o padrão antes de mexer nos módulos maiores (`encontros/`, `iam/`).
