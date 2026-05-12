import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { EmployeeController } from './controllers/employees.controller';
import { ManagersController } from './controllers/managers.controller';
import { AvailabilityModule } from 'src/availability/availability.module';
import { LeaveRequestModule } from 'src/leave-request/leave-request.module';
import { CompanyModule } from 'src/company/company.module';
import { Company } from 'src/company/entity/company.entity';
import { CompanyJobRole } from 'src/company/entity/company-job-role.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, CompanyJobRole]), AvailabilityModule, LeaveRequestModule, CompanyModule, NotificationsModule],
  providers: [UsersService],
  controllers: [UsersController, EmployeeController, ManagersController],
  exports: [UsersService]
})

export class UsersModule {}
