import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";
import { UsersService } from './users/users.service';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.init();

  const usersService = app.get(UsersService);
  await usersService.createInitialManager();
  
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
);

await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
