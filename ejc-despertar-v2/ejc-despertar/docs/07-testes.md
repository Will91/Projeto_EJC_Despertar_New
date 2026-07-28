# Etapa 7 — Testes
## Sistema EJC Despertar

## 1. O que foi automatizado neste projeto

| Tipo | Onde | O que cobre |
|---|---|---|
| Unitário | `apps/api/src/modules/financeiro/__tests__/financeiro.service.spec.ts` | Regra de cálculo de saldo (entradas − saídas, em centavos), isolada do banco via mock do repository |
| Integração (e2e) | `apps/api/test/app.e2e-spec.ts` | Fluxo de autenticação: registro → login com senha errada (401) → login correto (200 + tokens) |
| Integração (e2e) | `apps/api/test/pessoas.e2e-spec.ts` | RBAC (401 sem token) + criar/buscar pessoa como admin |
| Integração (e2e) | `apps/api/test/encontros.e2e-spec.ts` | O fluxo mais crítico do sistema: encontrar encontro ativo (rota pública) → inscrever pessoa → confirmar inscrição → **rejeitar inscrição duplicada** (regra de negócio que existia no legado) |

Rodar:
```bash
cd apps/api
npm run test        # unitários
npm run test:e2e    # integração (precisa de DATABASE_URL de teste configurado)
```

## 2. Por que esse recorte, e não 100% de cobertura

Seguindo o princípio de "peso onde o risco é maior": os testes de integração cobrem exatamente os pontos que a Etapa 1 identificou como frágeis no sistema legado — autenticação sem proteção, ausência de validação de regra de negócio (inscrição duplicada) e controle de acesso (RBAC). Não escrevi um teste para cada endpoint dos 8 módulos porque, neste momento do projeto, o retorno de investimento é maior garantindo que o **caminho crítico** (login → inscrição → confirmação) nunca quebre do que perseguir 100% de cobertura de linhas.

## 3. O que falta para uma suíte de testes madura (próximos passos, fora do escopo desta etapa)

- Testes de integração para os módulos `institucional`, `comunicacao`, `biblioteca` e `financeiro` (endpoints CRUD simples — baixo risco, mas ainda vale ter).
- Testes unitários para `EncontrosService` (janela de inscrição fechada, regra de "só um encontro ativo por vez", atrelamento de casal).
- Testes de front-end (React Testing Library) para os formulários — especialmente `/cadastro`, que é a porta de entrada pública do sistema.
- Testes de carga (ex.: k6 ou Artillery) simulando o pico de acesso que costuma acontecer na abertura das inscrições de um encontro.
- Pipeline de CI rodando os testes automaticamente a cada push (ver Etapa 8 — já incluído no workflow do GitHub Actions).

## 4. Checklist manual sugerido antes de qualquer deploy

Enquanto a suíte automatizada não cobre 100% dos módulos, valide manualmente:
- [ ] Cadastro público (`/cadastro`) cria a `Pessoa` e a `Inscricao` corretamente
- [ ] Login com credenciais erradas não revela se o e-mail existe
- [ ] Um usuário `ENCONTRISTA` não consegue acessar `/portal/financeiro` nem endpoints administrativos (teste manual do RBAC)
- [ ] Exportação de Excel e PDF gera arquivos abríveis com os dados corretos
- [ ] Auditoria (`/admin/logs`) registra as ações de escrita realizadas durante o teste
