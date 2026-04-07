import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { LeaveRequest } from './leave-request/entities/leave-request.entity';
import { Availability } from './availability/entities/availability.entity';
import { AvailabilityModule } from './availability/availability.module';
import { LeaveRequestModule } from './leave-request/leave-request.module';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [TypeOrmModule.forRoot(
    {
      type: "sqlite",
      database: "db.sqlite",
      entities: [User, LeaveRequest, Availability],
      synchronize: true,
    }
  ), UsersModule, AuthModule, AvailabilityModule, LeaveRequestModule, ScheduleModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  
}
