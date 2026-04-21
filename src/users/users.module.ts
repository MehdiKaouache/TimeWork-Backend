import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { EmployeeController } from './controllers/employees.controller';
import { ManagersController } from './controllers/managers.controller';
import { AvailabilityModule } from 'src/availability/availability.module';
import { LeaveRequestModule } from 'src/leave-request/leave-request.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AvailabilityModule, LeaveRequestModule],
  providers: [UsersService],
  controllers: [UsersController, EmployeeController, ManagersController],
  exports: [UsersService]
})

export class UsersModule {}
