import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Cobre o fluxo central do sistema: encontrar o encontro ativo (rota
 * pública), inscrever uma pessoa nele e confirmar a inscrição como
 * admin — o mesmo caminho que a tela /cadastro do front-end percorre.
 */
describe('Encontros e Inscrições (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: 'admin@ejcdespertar.org.br',
      password: 'TrocarAntesDeUsar#2026',
    });
    adminToken = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('encontra o encontro ativo criado pelo seed, sem precisar de login', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/encontros/ativo').expect(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('INSCRICOES_ABERTAS');
  });

  it('inscreve uma pessoa e confirma a inscrição', async () => {
    const encontro = await request(app.getHttpServer()).get('/api/v1/encontros/ativo');

    const pessoa = await request(app.getHttpServer())
      .post('/api/v1/pessoas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Fluxo', sobrenome: 'Completo', dataNascimento: '2007-01-01' });

    const inscricao = await request(app.getHttpServer())
      .post('/api/v1/encontros/inscricoes')
      .send({ pessoaId: pessoa.body.id, encontroId: encontro.body.id })
      .expect(201);

    expect(inscricao.body.status).toBe('PENDENTE');

    const confirmada = await request(app.getHttpServer())
      .patch(`/api/v1/encontros/inscricoes/${inscricao.body.id}/confirmar`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(confirmada.body.status).toBe('CONFIRMADO');
    expect(confirmada.body.qrCodeToken).toBeTruthy();
  });

  it('rejeita inscrição duplicada da mesma pessoa no mesmo encontro', async () => {
    const encontro = await request(app.getHttpServer()).get('/api/v1/encontros/ativo');

    const pessoa = await request(app.getHttpServer())
      .post('/api/v1/pessoas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Duplicado', sobrenome: 'Teste', dataNascimento: '2007-01-01' });

    await request(app.getHttpServer())
      .post('/api/v1/encontros/inscricoes')
      .send({ pessoaId: pessoa.body.id, encontroId: encontro.body.id })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/encontros/inscricoes')
      .send({ pessoaId: pessoa.body.id, encontroId: encontro.body.id })
      .expect(409);
  });
});
