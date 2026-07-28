# Etapa 4 — Modelagem do Banco de Dados
## Sistema EJC Despertar

> Aguardando aprovação para avançar à Etapa 5 (Desenvolvimento do back-end).

Como combinado, não temos o dump do banco atual — então este schema foi **reconstruído a partir da lógica real do código legado** (nomes de tabelas e campos encontrados em `InserirBanco.php`, `ClasseInscricao.php`, `ClasseCasais.php`, `ClasseCirculo.php`), modernizado e ampliado com o que você pediu no briefing original (perfil completo, RBAC, biblioteca, comunicação, financeiro nativo, auditoria).

---

## 1. De onde vieram os dados (rastreabilidade legado → novo)

| Tabela legada (MySQL) | Campos identificados no código | Vira no novo modelo |
|---|---|---|
| `tbl_usuarios` | `usuario`, `senha`, `TipoUsuario_id` | `User` + `Role` (RBAC de verdade, hoje é só um ID solto) |
| `tbl_membros` | `nome`, `sobrenome`, `sexo`, `dataNascimento`, `rg`, `telefone`, `celular`, `endereco`, `numero`, `bairroEndereco`, `complementoEndereco`, `cep`, `primResponsavel`, `grauParentUm`, `primResponsavelCelular`, `segResponsavel`, `grauParentDois`, `DoisResponsavelCelular`, `email`, `facebook`, `batizado`, `comunhao`, `crismado`, `outroEjc`, `nomeOutroEjc`, `indicacao` | `Pessoa` (perfil unificado — inclui os campos que você pediu: foto, apelido, equipe, histórico, observações) |
| `tbl_encontro` | `tema`, `dataEncontro`, `local`, `iniInscricoes`, `fimInscricoes`, `status` | `Encontro` |
| `tbl_encontrista` | `membro_id`, `encontro_id`, `casal_id`, `circulo_id`, `confirmacao`, `primeiroDia`, `segundoDia`, `cartas` | `Inscricao` (participação de uma `Pessoa` em um `Encontro` específico) |
| `tbl_casal` | `primeiroComponente`, `segundoComponente`, `telefone`, `celular`, `endereco`, `encontro_id` | `Casal` (padrinhos/madrinhas responsáveis por um círculo) |
| `tbl_circulos` | `nome`, `encontro_id` | `Circulo` |

**Achado importante confirmado aqui:** o sistema legado já modelava corretamente a diferença entre **pessoa** (`tbl_membros`, dados fixos de alguém) e **inscrição** (`tbl_encontrista`, a participação daquela pessoa em um encontro específico). Isso é uma boa decisão de modelagem que **preservamos** — é o que permite que a mesma pessoa participe de vários encontros ao longo dos anos sem duplicar cadastro, algo que seu briefing pede explicitamente ("histórico" no perfil).

Também ficou claro que `batizado`/`comunhao`/`crismado` e os campos de responsável/parentesco existem porque o público majoritário são **jovens, muitas vezes menores de idade** — então o novo modelo mantém e reforça isso (dados de responsável ficam obrigatórios quando a pessoa é menor).

---

## 2. Convenção adotada

- Entidades de **domínio do encontro** ficam em português (`Pessoa`, `Encontro`, `Inscricao`, `Circulo`, `Casal`, `Equipe`) — é a linguagem que vocês já usam no dia a dia, e manter isso facilita a comunicação entre o time técnico e a coordenação (linguagem ubíqua).
- Entidades **de infraestrutura/genéricas** (usuário do sistema, papéis, log de auditoria, refresh token) ficam em inglês, seguindo a convenção usual do ecossistema Node/Prisma/NestJS.
- Todo modelo tem `id` (UUID), `createdAt`, `updatedAt`; os que precisam de trilha (pedida na Etapa 1) também têm `createdById`/`updatedById`.

---

## 3. Schema Prisma completo

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// IAM — Identidade, acesso e RBAC
// ============================================================

enum RoleName {
  ADMIN
  COORDENACAO
  SECRETARIA
  TESOURARIA
  EQUIPE
  ENCONTRISTA
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  emailVerified Boolean   @default(false)
  isActive      Boolean   @default(true)
  roles         UserRole[]
  pessoa        Pessoa?   @relation(fields: [pessoaId], references: [id])
  pessoaId      String?   @unique
  refreshTokens RefreshToken[]
  auditLogs     AuditLog[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Role {
  id    String     @id @default(uuid())
  name  RoleName   @unique
  users UserRole[]
}

model UserRole {
  userId String
  roleId String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role @relation(fields: [roleId], references: [id], onDelete: Cascade)
  @@id([userId, roleId])
}

model RefreshToken {
  id        String   @id @default(uuid())
  tokenHash String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime @default(now())
}

// ============================================================
// PESSOAS — perfil unificado (substitui tbl_membros)
// ============================================================

model Pessoa {
  id                      String    @id @default(uuid())
  nome                    String
  sobrenome               String
  apelido                 String?
  fotoUrl                 String?
  sexo                    String?
  dataNascimento          DateTime
  rg                      String?
  telefone                String?
  celular                 String?
  email                   String?
  facebook                String?

  // endereço
  endereco                String?
  numero                  String?
  bairro                  String?
  complemento             String?
  cep                     String?

  // responsável (obrigatório quando menor de idade — validado na service layer)
  responsavelNome         String?
  responsavelParentesco   String?
  responsavelCelular      String?
  responsavelDoisNome     String?
  responsavelDoisParentesco String?
  responsavelDoisCelular  String?

  // vida de fé
  batizado                Boolean   @default(false)
  primeiraComunhao        Boolean   @default(false)
  crismado                Boolean   @default(false)
  participouOutroEjc      Boolean   @default(false)
  nomeOutroEjc            String?
  indicacaoPor            String?

  observacoes             String?

  equipeId                String?
  equipe                  Equipe?   @relation(fields: [equipeId], references: [id])

  user                    User?
  inscricoes              Inscricao[]
  casalComoPrimeiro       Casal[]   @relation("CasalPrimeiroComponente")
  casalComoSegundo        Casal[]   @relation("CasalSegundoComponente")

  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  @@index([nome, sobrenome])
}

model Equipe {
  id        String    @id @default(uuid())
  nome      String    @unique
  descricao String?
  pessoas   Pessoa[]
}

// ============================================================
// ENCONTROS — substitui tbl_encontro / tbl_encontrista /
// tbl_circulos / tbl_casal
// ============================================================

enum StatusEncontro {
  PLANEJADO
  INSCRICOES_ABERTAS
  EM_ANDAMENTO
  FINALIZADO
  CANCELADO
}

model Encontro {
  id                String          @id @default(uuid())
  tema              String
  numero            Int?
  dataInicio        DateTime
  dataFim           DateTime?
  local             String
  status            StatusEncontro  @default(PLANEJADO)
  inicioInscricoes  DateTime
  fimInscricoes     DateTime

  inscricoes        Inscricao[]
  circulos          Circulo[]
  casais            Casal[]
  transacoes        Transacao[]

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
}

model Circulo {
  id         String      @id @default(uuid())
  nome       String
  encontroId String
  encontro   Encontro    @relation(fields: [encontroId], references: [id])
  casalId    String?
  casal      Casal?      @relation(fields: [casalId], references: [id])
  inscricoes Inscricao[]

  @@unique([encontroId, nome])
}

model Casal {
  id                  String   @id @default(uuid())
  encontroId          String
  encontro            Encontro @relation(fields: [encontroId], references: [id])
  primeiroComponenteId String
  primeiroComponente  Pessoa   @relation("CasalPrimeiroComponente", fields: [primeiroComponenteId], references: [id])
  segundoComponenteId String
  segundoComponente   Pessoa   @relation("CasalSegundoComponente", fields: [segundoComponenteId], references: [id])
  telefone            String?
  celular             String?
  endereco            String?
  ativo               Boolean  @default(true)
  circulos            Circulo[]
  inscricoesPadrinhos Inscricao[] @relation("InscricaoCasalPadrinho")
}

enum StatusConfirmacao {
  PENDENTE
  CONFIRMADO
  RECUSADO
}

model Inscricao {
  id             String             @id @default(uuid())
  pessoaId       String
  pessoa         Pessoa             @relation(fields: [pessoaId], references: [id])
  encontroId     String
  encontro       Encontro           @relation(fields: [encontroId], references: [id])
  circuloId      String?
  circulo        Circulo?           @relation(fields: [circuloId], references: [id])
  casalId        String?
  casal          Casal?             @relation("InscricaoCasalPadrinho", fields: [casalId], references: [id])

  status         StatusConfirmacao  @default(PENDENTE)
  confirmadoEm   DateTime?
  primeiroDiaEm  DateTime?
  segundoDiaEm   DateTime?
  cartasEm       DateTime?

  qrCodeToken    String?            @unique
  checkIns       CheckIn[]

  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt

  @@unique([pessoaId, encontroId])
}

model CheckIn {
  id          String    @id @default(uuid())
  inscricaoId String
  inscricao   Inscricao @relation(fields: [inscricaoId], references: [id])
  registradoEm DateTime @default(now())
  registradoPorId String?
}

// ============================================================
// INSTITUCIONAL — substitui o WordPress
// ============================================================

enum StatusPublicacao {
  RASCUNHO
  PUBLICADO
}

model Noticia {
  id        String           @id @default(uuid())
  titulo    String
  slug      String           @unique
  conteudo  String
  capaUrl   String?
  status    StatusPublicacao @default(RASCUNHO)
  publicadoEm DateTime?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
}

model Album {
  id     String  @id @default(uuid())
  titulo String
  fotos  Foto[]
  createdAt DateTime @default(now())
}

model Foto {
  id      String  @id @default(uuid())
  albumId String
  album   Album   @relation(fields: [albumId], references: [id])
  url     String
  legenda String?
}

model AgendaEvento {
  id        String   @id @default(uuid())
  titulo    String
  descricao String?
  dataInicio DateTime
  dataFim   DateTime?
  local     String?
}

model Slide {
  id       String  @id @default(uuid())
  imagemUrl String
  linkUrl  String?
  ordem    Int     @default(0)
  ativo    Boolean @default(true)
}

model Contato {
  id        String   @id @default(uuid())
  nome      String
  email     String
  mensagem  String
  lido      Boolean  @default(false)
  createdAt DateTime @default(now())
}

// ============================================================
// COMUNICAÇÃO
// ============================================================

model Aviso {
  id        String   @id @default(uuid())
  titulo    String
  conteudo  String
  fixado    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Notificacao {
  id        String   @id @default(uuid())
  userId    String
  titulo    String
  mensagem  String
  lida      Boolean  @default(false)
  createdAt DateTime @default(now())
}

// ============================================================
// BIBLIOTECA
// ============================================================

enum TipoRecurso {
  DOCUMENTO
  FOTO
  VIDEO
  ORACAO
  MUSICA
  FORMACAO
}

model RecursoBiblioteca {
  id        String      @id @default(uuid())
  titulo    String
  tipo      TipoRecurso
  arquivoUrl String
  descricao String?
  createdAt DateTime    @default(now())
}

// ============================================================
// FINANCEIRO (novo — não migra o script antigo)
// ============================================================

enum TipoTransacao {
  ENTRADA
  SAIDA
}

model CategoriaFinanceira {
  id          String        @id @default(uuid())
  nome        String        @unique
  transacoes  Transacao[]
}

model Transacao {
  id           String              @id @default(uuid())
  tipo         TipoTransacao
  descricao    String
  valorCentavos Int
  categoriaId  String?
  categoria    CategoriaFinanceira? @relation(fields: [categoriaId], references: [id])
  encontroId   String?
  encontro     Encontro?           @relation(fields: [encontroId], references: [id])
  responsavelId String?
  data         DateTime            @default(now())
  createdAt    DateTime            @default(now())
}

// ============================================================
// AUDITORIA — pedida na Etapa 1 (quem, quando, IP)
// ============================================================

model AuditLog {
  id         String   @id @default(uuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id])
  acao       String
  entidade   String
  entidadeId String?
  ip         String?
  detalhes   Json?
  createdAt  DateTime @default(now())

  @@index([entidade, entidadeId])
}
```

---

## 4. Decisões de modelagem que valem explicação

- **`Pessoa` × `Inscricao` separados** (em vez de repetir os dados a cada encontro): preserva a decisão correta que já existia no legado e viabiliza o "histórico de encontros que participou" pedido no seu briefing — basta listar as `Inscricao` de uma `Pessoa`.
- **`valorCentavos: Int`** no financeiro em vez de `Float`: evita os clássicos erros de arredondamento de ponto flutuante em dinheiro — valor guardado em centavos.
- **`qrCodeToken` único em `Inscricao`**: prepara o terreno para o check-in por QR Code pedido no briefing, sem precisar de tabela extra.
- **`AuditLog` genérico** (entidade + entidadeId + ação + JSON de detalhes) em vez de uma tabela de log por entidade: um único mecanismo cobre "quem alterou o quê, quando, de que IP" pedido na Etapa 1, para qualquer módulo novo que for criado no futuro.
- **RBAC via `Role`/`UserRole`** em vez de um campo fixo `tipoUsuario` (como no legado): permite um usuário ter mais de um papel (ex.: alguém da Secretaria que também é Coordenação) sem redesenhar o banco depois.

---

## 5. Como resolvemos a ausência do dump

Como você confirmou que não tem acesso ao banco atual, o caminho será:

1. Rodar as **migrations** deste schema (`prisma migrate dev`) para criar o banco novo do zero.
2. Criar um **seed** (`prisma/seed.ts`) com dados fictícios realistas (alguns `Pessoa`, um `Encontro` ativo, `Circulo`s, `Casal`, `Inscricao`s em diferentes estágios de confirmação) para que você já consiga testar todas as telas do protótipo com dados de verdade.
3. Se, mais adiante, vocês conseguirem exportar um dump do MySQL antigo (mesmo que parcial), eu escrevo um **script de migração** pontual (`scripts/migrate-legacy.ts`) que lê o dump e popula o schema novo — sem impacto no restante do projeto, porque é só um script auxiliar descartável.

---

## Próximo passo

Etapa 5 é **Desenvolvimento do back-end** (NestJS + Prisma, módulo por módulo, começando por IAM e depois Encontros/Inscrições). Posso seguir?
