import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.enableCors({ origin: config.get<string>('CORS_ORIGIN'), credentials: true });

  // Serve os arquivos do LocalStorageProvider (módulo de Uploads).
  // Em produção com um StorageProvider baseado em S3, esta linha deixa
  // de ser necessária (os arquivos já ficam servidos pelo provedor).
  app.useStaticAssets(path.resolve(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // whitelist: remove campos não declarados no DTO — evita mass assignment.
  // forbidNonWhitelisted: rejeita a requisição se vier campo extra, em vez
  // de simplesmente ignorar (mais seguro e mais fácil de depurar no front).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  // Documentação Swagger — pedida no briefing original. Disponível apenas
  // fora de produção para não expor o mapa completo de rotas publicamente.
  if (config.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('EJC Despertar API')
      .setDescription('API da nova plataforma do EJC Despertar — ver /docs no repositório para o histórico de decisões (Etapas 1-4).')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = config.get<number>('PORT')!;
  await app.listen(port);
  console.log(`API rodando em http://localhost:${port}/api/v1`);
  console.log(`Documentação Swagger em http://localhost:${port}/api/docs`);
}
bootstrap();
