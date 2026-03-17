import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";


const cookieSession = require("cookie-session")

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.use(cookieSession({
    keys: ["mysecretkey"],
    httpOnly: true,
    secure: false,
  }))

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
