import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { CurrentUserInterceptor } from './interceptors/currentUser.interceptor';
import { APP_INTERCEPTOR } from "@nestjs/core"
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { EmployeeController } from './controllers/employees/employees.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  // providers: [UsersService, AuthService, CurrentUserInterceptor],
  providers: [UsersService, AuthService, CurrentUserMiddleware
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CurrentUserInterceptor,
    // }
  ],
  controllers: [UsersController, EmployeeController]
})

export class UsersModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*')
  }
}
