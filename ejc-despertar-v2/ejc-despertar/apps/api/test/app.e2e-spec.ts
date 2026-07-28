import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Teste de integração de exemplo (pedido no briefing original).
 * Cobre o fluxo crítico de autenticação: registro -> login com senha
 * errada (deve falhar) -> login correto (deve retornar tokens).
 *
 * Requer um DATABASE_URL de teste configurado (ver .env.example).
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: `teste.${Date.now()}@ejcdespertar.org.br`,
    password: 'SenhaForte#123',
    nome: 'Teste',
    sobrenome: 'Automatizado',
  };

  it('deve registrar um novo usuário e devolver tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('deve rejeitar login com senha incorreta', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'senha-errada' })
      .expect(401);
  });

  it('deve autenticar com a senha correta', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
  });
});
