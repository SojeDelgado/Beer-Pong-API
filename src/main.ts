import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';


async function bootstrap() {

  const logger = new Logger('BeerPong-API');

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);

  logger.log(`API running on port ${3000}`);
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
