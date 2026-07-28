/**
 * Seed de dados de teste — necessário porque não temos acesso ao
 * banco de dados legado (decisão registrada na Etapa 4).
 * Roda com: npm run prisma:seed
 */
import { PrismaClient, RoleName, StatusEncontro, StatusConfirmacao } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Papéis (RBAC)
  const roleNames = Object.values(RoleName);
  for (const name of roleNames) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }

  // 2. Equipes
  const equipeCozinha = await prisma.equipe.upsert({
    where: { nome: 'Cozinha' },
    update: {},
    create: { nome: 'Cozinha', descricao: 'Responsável pela alimentação do encontro' },
  });
  const equipeLiturgia = await prisma.equipe.upsert({
    where: { nome: 'Liturgia' },
    update: {},
    create: { nome: 'Liturgia' },
  });

  // 3. Usuário administrador inicial
  const adminPasswordHash = await bcrypt.hash('TrocarAntesDeUsar#2026', 10);
  const adminPessoa = await prisma.pessoa.create({
    data: {
      nome: 'Administrador',
      sobrenome: 'do Sistema',
      dataNascimento: new Date('1990-01-01'),
      email: 'admin@ejcdespertar.org.br',
    },
  });
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleName.ADMIN } });
  await prisma.user.create({
    data: {
      email: 'admin@ejcdespertar.org.br',
      passwordHash: adminPasswordHash,
      emailVerified: true,
      pessoaId: adminPessoa.id,
      roles: { create: [{ roleId: adminRole.id }] },
    },
  });

  // 4. Um encontro ativo, com inscrições abertas
  const encontro = await prisma.encontro.create({
    data: {
      tema: 'Despertar 47',
      numero: 47,
      local: 'Casa de Retiros Bom Pastor',
      status: StatusEncontro.INSCRICOES_ABERTAS,
      dataInicio: new Date('2026-09-04'),
      dataFim: new Date('2026-09-06'),
      inicioInscricoes: new Date('2026-07-01'),
      fimInscricoes: new Date('2026-08-25'),
    },
  });

  const circulo1 = await prisma.circulo.create({
    data: { nome: 'Círculo 1', encontroId: encontro.id },
  });
  const circulo3 = await prisma.circulo.create({
    data: { nome: 'Círculo 3', encontroId: encontro.id },
  });

  // 5. Pessoas + inscrições de exemplo (refletem as telas do protótipo, Etapa 3)
  const pessoasSeed = [
    { nome: 'Maria Clara', sobrenome: 'Souza', apelido: 'Mari', circuloId: circulo3.id, status: StatusConfirmacao.CONFIRMADO, equipeId: null },
    { nome: 'João Pedro', sobrenome: 'Lima', apelido: null, circuloId: circulo1.id, status: StatusConfirmacao.PENDENTE, equipeId: equipeCozinha.id },
    { nome: 'Ana Flávia', sobrenome: 'Ramos', apelido: null, circuloId: circulo3.id, status: StatusConfirmacao.CONFIRMADO, equipeId: null },
    { nome: 'Rafael', sobrenome: 'Tavares', apelido: null, circuloId: null, status: StatusConfirmacao.PENDENTE, equipeId: equipeLiturgia.id },
  ];

  for (const p of pessoasSeed) {
    const pessoa = await prisma.pessoa.create({
      data: {
        nome: p.nome,
        sobrenome: p.sobrenome,
        apelido: p.apelido ?? undefined,
        dataNascimento: new Date('2005-05-15'),
        email: `${p.nome.toLowerCase().replace(/\s/g, '.')}@exemplo.com`,
        equipeId: p.equipeId ?? undefined,
      },
    });
    await prisma.inscricao.create({
      data: {
        pessoaId: pessoa.id,
        encontroId: encontro.id,
        circuloId: p.circuloId ?? undefined,
        status: p.status,
        confirmadoEm: p.status === StatusConfirmacao.CONFIRMADO ? new Date() : undefined,
      },
    });
  }

  console.log('Seed concluído: 1 admin, 1 encontro ativo, 2 círculos, 4 pessoas/inscrições.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
