import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CurrentUserMiddleware } from '../common/middleware/current-user.middleware';
import { EmployeeController } from './controllers/employees.controller';

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
