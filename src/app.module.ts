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
import { ShiftModule } from './shift/shift.module';
import { Shift } from './shift/entities/shift.entity';
import { ScheduleModule } from './schedule/schedule.module';
import { Schedule } from './schedule/entities/schedule.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(
    {
      isGlobal: true
    }
  ),

   TypeOrmModule.forRoot(
    {
      type: "sqlite",
      database: "db.sqlite",
      entities: [User, LeaveRequest, Availability, Shift, Schedule],
      synchronize: true,
    }
  ),
    UsersModule,
    AuthModule,
    AvailabilityModule,
    LeaveRequestModule,
    ShiftModule,
    ScheduleModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
