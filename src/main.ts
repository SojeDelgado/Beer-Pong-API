import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';


async function bootstrap() {

  const logger = new Logger('Beer-Pong-API')

  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    }),
  );
  
  app.enableCors();
  
  await app.listen(envs.port, '0.0.0.0');
  logger.log(`Beer Pong running on port ${ envs.port }`);

}

bootstrap();