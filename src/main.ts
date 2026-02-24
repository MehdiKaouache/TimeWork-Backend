import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true, //supprime les propriétés non définis dans le DTO
      forbidNonWhitelisted: true, // declanche une erreur quand il y a un argent qu'on ne veux pas recevoir
      transform: true // fait ce que la class transformer fait
    }
  ));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
