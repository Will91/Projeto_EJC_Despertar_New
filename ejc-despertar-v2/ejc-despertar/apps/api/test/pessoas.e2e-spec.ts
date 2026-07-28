import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Cobre o módulo de Pessoas: um usuário sem papel administrativo não
 * pode listar pessoas (RBAC), e um admin autenticado consegue criar
 * e depois recuperar o registro criado.
 */
describe('Pessoas (e2e)', () => {
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

    // usuário criado pelo seed (ver prisma/seed.ts)
    const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({
      email: 'admin@ejcdespertar.org.br',
      password: 'TrocarAntesDeUsar#2026',
    });
    adminToken = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejeita listagem sem token (401)', async () => {
    await request(app.getHttpServer()).get('/api/v1/pessoas').expect(401);
  });

  it('cria e depois busca uma pessoa como admin', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/v1/pessoas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Encontrista',
        sobrenome: 'De Teste',
        dataNascimento: '2006-03-10',
      })
      .expect(201);

    expect(create.body).toHaveProperty('id');

    const found = await request(app.getHttpServer())
      .get(`/api/v1/pessoas/${create.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(found.body.nome).toBe('Encontrista');
  });
});
