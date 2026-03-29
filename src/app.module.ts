import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { LeaveRequest } from './leave-request/leave-request.entity';
import { Availability } from './availability/availability.entity';
@Module({
  imports: [TypeOrmModule.forRoot(
    {
      type: "sqlite",
      database: "db.sqlite",
      entities: [User, LeaveRequest, Availability],
      synchronize: true,
    }
  ), UsersModule, AuthModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
