import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthService } from './auth.service';
import { CurrentUserInterceptor } from './interceptor/currentUser.interceptor';
import { CurrentUserMiddleware } from './middleware/currentUser.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  //providers: [UsersService, AuthService, CurrentUserInterceptor]
  providers: [UsersService, AuthService, CurrentUserMiddleware
    //{
      //provide: 'APP_INTERCEPTOR',
      //useClass: CurrentUserInterceptor,
    //},
  ],
})

export class UsersModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
