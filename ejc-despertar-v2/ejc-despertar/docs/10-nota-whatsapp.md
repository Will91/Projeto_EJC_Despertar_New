# Nota — Integração com WhatsApp

O briefing original marcava isso como "quando possível", e é a única lacuna
da lista da Etapa 9 que não implementei nesta rodada. Motivo: diferente de
e-mail (que funciona com qualquer SMTP, inclusive gratuito, sem burocracia),
uma integração de WhatsApp de verdade exige uma das duas coisas:

1. **WhatsApp Business API oficial (via Meta)** — precisa de aprovação de
   conta comercial, número de telefone dedicado e verificação do negócio
   junto à Meta. Não é algo que se resolve só com código; é um processo de
   dias/semanas que só vocês (como responsáveis legais pelo grupo) podem
   iniciar.
2. **Provedores terceirizados (Twilio, Z-API, etc.)** — mais rápidos de
   configurar, mas exigem uma conta paga e credenciais próprias seguindo o
   mesmo prazo de aprovação da Meta por baixo dos panos.

Ambos os caminhos exigem **credenciais que só existem depois que vocês
abrem a conta** — não é algo que eu consigo simular ou deixar "pronto para
usar" sem essas chaves.

## O que já deixei preparado para quando vocês tiverem a conta

O `EmailService` (`apps/api/src/modules/email/email.service.ts`) foi escrito
como uma abstração simples de canal de notificação. Criar um
`WhatsAppService` seguindo o mesmo formato — um método `send({ to, message })`
que troca de provedor via variável de ambiente, exatamente como fizemos com
SMTP — é um trabalho de algumas horas assim que vocês tiverem:
- Um número de WhatsApp Business verificado, ou
- Uma conta na Twilio/Z-API com o número já conectado

Quando tiver isso, é só voltar aqui que eu implemento a integração de verdade
usando as credenciais reais.
