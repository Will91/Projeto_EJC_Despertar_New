# Etapa 1 — Análise do Código Legado
## Sistema EJC Despertar

> Documento de referência técnica. Aguardando aprovação para avançar à Etapa 2 (Planejamento da nova arquitetura).

---

## 1. Visão geral do que foi recebido

O pacote enviado (`ejcdespertar.zip`, ~11 mil arquivos) contém, na verdade, **três sistemas diferentes empacotados juntos**, além de cópias duplicadas da mesma estrutura de pastas (o zip parece ter sido gerado a partir de backups aninhados: `ejcdespertar/ejcdespertar/...` e `public_html/public_html/...` repetem o mesmo conteúdo). Isso já é o primeiro ponto de atenção: **antes de qualquer migração, precisamos consolidar qual cópia é a "fonte da verdade"**, pois arquivos com o mesmo nome podem estar levemente diferentes entre as pastas duplicadas.

Os três sistemas identificados são:

| Sistema | Pasta | O que faz |
|---|---|---|
| **Site institucional** | `administrativoejc/` | WordPress completo (core + temas padrão do WP + plugin Akismet). Não é código autoral do grupo — é só a instalação do WordPress. |
| **Painel Admin (site antigo)** | `admin/` | CMS caseiro para notícias, álbuns de fotos, agenda, vídeos, slides e contatos do site institucional antigo. |
| **Sistema de Inscrições (o "coração" do projeto)** | `sistemaejc/SistemaDespertar/` | Sistema de gestão de encontros/retiros: inscrição de encontristas, atrelamento de casais/padrinhos, círculos, controle de presença, exportação de PDF, comprovantes. **Este é provavelmente o sistema que mais importa para vocês.** |
| **Financeiro** | `financeiro/` | Um script de terceiros pronto ("Sistema Simples de Livro Caixa em PHP 1.3", ainda em `.zip` sem nem ser extraído no servidor), com login e config próprios, isolado do resto. |

Isso muda um pouco o enquadramento do projeto: não é "modernizar 1 sistema", é **consolidar 3 sistemas heterogêneos em 1 só**, decidindo o que vira módulo da nova plataforma e o que é substituível por algo pronto (ex: o financeiro provavelmente não precisa ser reescrito do zero — dá pra repensar).

---

## 2. Arquitetura atual

- **Padrão:** PHP procedural/OO misto, sem framework, sem MVC real. Cada página `.php` mistura busca de dados, regra de negócio e HTML no mesmo arquivo (ex.: `admin/login.php`, `sistemaejc/SistemaDespertar/EntradaEncontristas.php`).
- **Acesso a banco:** uma classe própria `Mysql` (`database/mysql.php`) que encapsula a extensão **`mysql_*`** do PHP — **extensão removida do PHP desde a versão 7.0 (2015)**. Ou seja, esse código, no estado atual, **não roda em nenhuma versão de PHP suportada hoje**.
- **Sessão/autenticação:** classe `Session` caseira, guarda dados em `$_SESSION`, sem nenhuma abstração de usuário/perfil real (sem RBAC).
- **Front-end:** HTML gerado no servidor + jQuery de diferentes eras (1.4.2, 1.5.1, 1.7.x, 1.9.x, todas desatualizadas) + Bootstrap antigo + bibliotecas soltas (Redactor, Uploadfy, FancyBox) copiadas manualmente para dentro do projeto (vendoring manual, sem gerenciador de pacotes).
- **Configuração:** credenciais de banco de dados **em texto puro dentro do código-fonte** (`database/database.conf.php`), versionadas junto com o resto — sem `.env`, sem segredo separado do código.
- **Deploy:** aparenta ser hospedagem compartilhada tradicional (cPanel-style, caminho `/home/ejcdespe/public_html/...` visível no `error_log`), upload direto de arquivos via FTP, sem Git, CI/CD, staging ou testes automatizados.

---

## 3. Pontos fracos / problemas de segurança (críticos)

Isso aqui merece destaque antes de qualquer outra coisa, porque são riscos reais, não só "código feio":

1. **Credenciais de banco expostas no código-fonte** (host, usuário e senha em `database.conf.php`). Se este zip já circulou por e-mail, WhatsApp, Drive etc., a senha exposta deve ser considerada comprometida e **trocada assim que possível**, independente da reescrita do sistema.
2. **SQL Injection real:** as queries são strings concatenadas manualmente (`"select * from users where user_login = '$user_login'..."`). A única proteção é `mysql_real_escape_string`, que é insuficiente em vários cenários e, de qualquer forma, pertence a uma extensão descontinuada e insegura.
3. **Senhas com MD5 sem salt** (`md5($_POST['user_password'])`) — MD5 é quebrável por força bruta/rainbow table em segundos. Não há hashing seguro (bcrypt/Argon2).
4. **Sem proteção CSRF** nos formulários de login e ações administrativas.
5. **Sem rate limiting** no login — dá pra tentar senha infinitas vezes.
6. **`error_reporting(0)` e `display_errors=0` forçados no código**, escondendo erros que poderiam revelar bugs de segurança durante o desenvolvimento (e sem logging estruturado substituindo isso).
7. **`error_log` de produção incluído no pacote entregue** — expõe caminho absoluto do servidor e comportamento interno da aplicação.
8. **Sem separação de permissões (RBAC)** — parece existir um único tipo de usuário admin, sem granularidade de papéis (coordenador, secretaria, tesouraria etc.), o que vocês pediram explicitamente na nova versão.

---

## 4. Problemas de desempenho

- Paginação feita manualmente com `LIMIT` fixo e contagem de linhas trazendo o resultado inteiro para PHP antes de paginar (`fetchAll()` roda antes do `LIMIT` ser aplicado, na classe `Mysql::query()`) — ineficiente à medida que a base cresce.
- Nenhum cache (nem de página, nem de query, nem de asset).
- Bibliotecas JS carregadas via CDN antigo em `http://` (não `https://`) e sem minificação/versionamento correto — múltiplas versões de jQuery carregadas em páginas diferentes do mesmo sistema.
- Imagens (285 arquivos `.png`/`.jpg` só nas pastas do sistema próprio, fora WordPress) sem pipeline de otimização.

---

## 5. Código duplicado

- Estrutura de pastas inteira duplicada dentro do próprio zip (`ejcdespertar/ejcdespertar/...`), o que precisa ser resolvido antes de importar para um repositório Git.
- `admin/` (site antigo) duplica boa parte da lógica de CRUD que também existe, com variações, dentro do `SistemaDespertar` (cada um com sua própria classe de paginação/banco).
- Vários arquivos com sufixo `_OLD` ou `Old` deixados no projeto ativo (`ClasseInscricao_OLD.php`, `InserirBanco_OLD.php`, `DetalhesEncontristasOLD.php`, `FinalEntradaEncontristaOld.php`) — indica ausência de controle de versão (Git), então "versões antigas" viram arquivos extras em vez de histórico de commits.
- Duas cópias da biblioteca FPDF (`fpdf/` e `fpdf_old/`).

## 6. Dependências obsoletas

| Dependência | Situação |
|---|---|
| Extensão `mysql_*` do PHP | Removida do PHP desde 7.0 (2015) — **bloqueador**, não roda em servidores atuais |
| jQuery 1.4.2 / 1.5.1 / 1.7.x / 1.9.2 | Todas descontinuadas, com CVEs conhecidas |
| jQuery UI 1.9.2 | Descontinuada |
| TinyMCE / Redactor antigos | Versões antigas, sem patches de segurança |
| PHPMailer (versão vendorizada manualmente) | Precisa checar versão exata — várias versões antigas do PHPMailer têm CVEs de RCE conhecidas |
| WordPress (em `administrativoejc/`) | Precisa checar se está na versão mais recente e com plugins atualizados — WordPress desatualizado é um dos vetores de ataque mais comuns da web |
| Bootstrap (versão embutida) | A confirmar versão, mas empacotado manualmente sem gerenciador de pacotes |

## 7. Dificuldades de manutenção

- Sem framework, sem padrão consistente entre os 3 subsistemas — cada um foi feito "à sua moda".
- Lógica de negócio, acesso a dados e HTML misturados no mesmo arquivo em praticamente todas as páginas.
- Sem testes automatizados de nenhum tipo.
- Sem documentação técnica além dos nomes dos arquivos.
- Sem controle de versão (não há indícios de `.git`) — o "histórico" são arquivos `_OLD` deixados manualmente.
- Charset ISO-8859-1 em várias páginas (`<meta charset="ISO-8859-1">`) em vez de UTF-8, o que vai gerar atrito na migração de dados/acentuação.

## 8. Oportunidades de melhoria (o que a reescrita resolve de cara)

- Unificar os 3 sistemas (site institucional, admin antigo, sistema de inscrições) em uma única aplicação com áreas/permissões bem definidas.
- Trocar MD5+mysql_* por autenticação moderna (JWT + refresh token + bcrypt/Argon2), como já está no seu briefing.
- Introduzir RBAC de verdade (coordenação, secretaria, tesouraria, equipes) — hoje não existe.
- Sair de hospedagem compartilhada com FTP para deploy versionado (Git + CI/CD), como você já planejou.
- Migrar o financeiro de um script isolado de terceiros para um módulo integrado (com trilha de auditoria, como pedido).
- Padronizar toda a entrada de texto em UTF-8.

---

## 9. Pergunta antes de seguir para a Etapa 2

Preciso confirmar 3 coisas para não perder nenhuma funcionalidade na migração e planejar corretamente a nova arquitetura:

1. **O `financeiro/` (livro caixa de terceiros) deve ser migrado/recriado como módulo próprio, ou vocês preferem manter separado / substituir por outra solução?**
2. **O `administrativoejc/` (WordPress) continua sendo o site institucional público, ou a ideia é que a nova aplicação (Next.js) também absorva o site institucional, matando o WordPress?**
3. Vocês têm **acesso ao banco de dados atual** (dump `.sql` ou acesso ao MySQL em produção)? A análise do código me mostra a lógica, mas preciso do **schema real das tabelas** (`users`, encontristas, casais, círculos, inscrições etc.) para modelar o novo banco em PostgreSQL/Prisma sem perder nenhum campo.

Assim que você confirmar esses 3 pontos (e aprovar esta análise), sigo para a **Etapa 2: Planejamento da nova arquitetura**.
