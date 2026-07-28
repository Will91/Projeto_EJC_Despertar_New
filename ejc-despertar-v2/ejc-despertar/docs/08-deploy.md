# Etapa 8 — Deploy
## Sistema EJC Despertar

## 1. Onde hospedar (conforme a stack definida na Etapa 2)

| Peça | Opção recomendada | Alternativas |
|---|---|---|
| Front-end (`apps/web`) | **Vercel** — feito pela mesma empresa do Next.js, deploy automático a cada push, ISR funciona nativamente | Render, VPS com Docker |
| Back-end (`apps/api`) | **Railway** ou **Render** — sobem o `Dockerfile` que já está pronto, com banco Postgres gerenciado | VPS Linux + Docker Compose |
| Banco de dados | Postgres gerenciado da própria Railway/Render, ou **Neon**/**Supabase** (Postgres serverless) | Postgres no mesmo VPS |

Para o público-alvo deste projeto (grupo de jovens, orçamento provavelmente limitado), a combinação **Vercel (front, plano gratuito) + Railway (back + banco, plano hobby)** é o caminho mais barato e com menos operação manual.

## 2. Variáveis de ambiente necessárias em produção

**Back-end (`apps/api`):**
```
DATABASE_URL=postgresql://usuario:senha@host:5432/banco
JWT_ACCESS_SECRET=<gerar com: openssl rand -base64 48>
JWT_REFRESH_SECRET=<gerar outro, diferente do access>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
PORT=3333
NODE_ENV=production
CORS_ORIGIN=https://ejcdespertar.org.br   # domínio real do front em produção
```

**Front-end (`apps/web`):**
```
NEXT_PUBLIC_API_URL=https://api.ejcdespertar.org.br/api/v1
```

⚠️ **Nunca reutilize os segredos do `.env.example`/seed em produção.** O usuário admin criado pelo seed (`admin@ejcdespertar.org.br` / `TrocarAntesDeUsar#2026`) deve ter a senha trocada imediatamente após o primeiro deploy real — ou melhor, o seed de produção não deveria rodar o mesmo script de dados fictícios, só a criação do usuário admin com senha gerada aleatoriamente e enviada por um canal seguro.

## 3. Passo a passo — Railway (back-end + banco)

1. Criar um projeto novo, conectar o repositório Git.
2. Adicionar um serviço PostgreSQL (Railway gera o `DATABASE_URL` automaticamente).
3. Adicionar um serviço apontando para `apps/api` (Railway detecta o `Dockerfile`).
4. Configurar as variáveis de ambiente da seção 2.
5. Rodar as migrations uma vez, manualmente, via terminal do Railway:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed   # só na primeira vez, e ajustando a senha do admin antes
   ```
6. Confirmar que `https://<seu-servico>.up.railway.app/api/v1` responde e que `/api/docs` (Swagger) carrega.

## 4. Passo a passo — Vercel (front-end)

1. Importar o repositório, apontando o **Root Directory** para `apps/web`.
2. Configurar a variável `NEXT_PUBLIC_API_URL` apontando para a URL pública da API (passo anterior).
3. Deploy automático a cada push na branch principal.

## 5. Deploy alternativo — VPS Linux com Docker Compose

Para quem preferir controlar o próprio servidor (útil se a comunidade já tiver um VPS):

```bash
git clone <repositorio>
cd ejc-despertar
cp apps/api/.env.example apps/api/.env   # preencher com valores reais
docker compose up --build -d
docker compose exec api npx prisma migrate deploy
```

Nesse cenário, um **Nginx** (ou Caddy, mais simples de configurar HTTPS automático) na frente do container `api` cuida do certificado SSL e do domínio.

## 6. Integração contínua (CI) — GitHub Actions

Arquivo incluído no projeto: `.github/workflows/ci.yml`. Ele roda, a cada push e pull request:
1. Instala as dependências do back-end
2. Roda `npm run build` (garante que TypeScript compila)
3. Sobe um Postgres temporário e roda `npm run test:e2e`
4. Roda `npm run build` do front-end

Isso fecha uma lacuna importante do sistema legado (Etapa 1: "sem Git, CI/CD, staging"): agora nenhum código quebrado deveria chegar à branch principal sem ser notado.

## 7. Checklist de corte (go-live)

- [ ] Segredos de produção gerados e diferentes dos de desenvolvimento
- [ ] Senha do usuário admin trocada
- [ ] `CORS_ORIGIN` da API apontando só para o domínio real do front
- [ ] HTTPS ativo em ambos (Vercel/Railway já fornecem por padrão)
- [ ] Backup automático do banco configurado (Railway/Render oferecem isso nos planos pagos)
- [ ] Domínio próprio apontado (se houver) via DNS
