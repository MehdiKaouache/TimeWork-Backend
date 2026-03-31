import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CurrentUserMiddleware } from '../common/middleware/current-user.middleware';
import { EmployeeController } from './controllers/employees.controller';
import { ManagersController } from './controllers/managers.controller';
import { AvailabilityModule } from 'src/availability/availability.module';
import { LeaveRequestModule } from 'src/leave-request/leave-request.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AvailabilityModule, LeaveRequestModule],
  providers: [UsersService, CurrentUserMiddleware
  ],
  controllers: [UsersController, EmployeeController, ManagersController],
  exports: [UsersService]
})

export class UsersModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*')
  }
}
