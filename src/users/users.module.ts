import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { EmployeeController } from './controllers/employees/employees.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, CurrentUserMiddleware
  ],
  controllers: [UsersController, EmployeeController],
  exports: [UsersService]
})

export class UsersModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*')
  }
}
