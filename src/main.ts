import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';


async function bootstrap() {

  const logger = new Logger('Beer-Pong-API')

  const app = await NestFactory.create(AppModule);
  await app.listen(envs.port);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    }),
  );

  app.enableCors();

  logger.log(`Beer Pong running on port ${ envs.port }`);

}

bootstrap();

// src/main.ts

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.useGlobalPipes(
//     new ValidationPipe()
//   );

//   // 1. Habilitar CORS para que Angular pueda consultar la API
//   app.enableCors();

//   // 2. Escuchar en 0.0.0.0 para permitir conexiones externas
//   // El puerto suele ser 3000 por defecto
//   await app.listen(3000, '0.0.0.0');

//   console.log(`Application is running on: ${await app.getUrl()}`);
// }
// bootstrap();
