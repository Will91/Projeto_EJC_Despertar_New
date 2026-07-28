import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Formações (e2e)', () => {
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

  it('permite envio público da ficha de formação, sem login', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/formacoes')
      .send({
        nome: 'Equipeiro de Teste',
        email: 'equipeiro@exemplo.com',
        idade: 24,
        ultimoEncontroTrabalhado: 'Despertar 46',
        ultimaEquipe: 'Liturgia',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
  });

  it('rejeita idade abaixo do mínimo (14 anos)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/formacoes')
      .send({
        nome: 'Muito Jovem',
        email: 'jovem@exemplo.com',
        idade: 10,
        ultimoEncontroTrabalhado: 'Despertar 46',
        ultimaEquipe: 'Cozinha',
      })
      .expect(400);
  });

  it('só admin/coordenação/secretaria conseguem listar as fichas', async () => {
    await request(app.getHttpServer()).get('/api/v1/formacoes').expect(401);

    const res = await request(app.getHttpServer())
      .get('/api/v1/formacoes')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
