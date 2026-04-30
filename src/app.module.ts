import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entity/user.entity';
import { AuthModule } from './auth/auth.module';
import { LeaveRequest } from './leave-request/entity/leave-request.entity';
import { Availability } from './availability/entity/availability.entity';
import { AvailabilityModule } from './availability/availability.module';
import { LeaveRequestModule } from './leave-request/leave-request.module';
import { ShiftModule } from './shift/shift.module';
import { Shift } from './shift/entity/shift.entity';
import { ScheduleModule } from './schedule/schedule.module';
import { Schedule } from './schedule/entity/schedule.entity';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';
import { Company } from './company/entity/company.entity';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'sandbox.smtp.mailtrap.io',
          port: 587,
          auth: {
            user: configService.get<string>('MAILER_USER'),
            pass: configService.get<string>('MAILER_PASS'),
          },
        },
        defaults: {
          from: 'TimeWork Support <noreply@timework.com>',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new EjsAdapter(),
          option: {
            strict: true
          }
        }
      })
    }),
    ConfigModule.forRoot(
    {
      isGlobal: true
    }
  ),

   TypeOrmModule.forRoot(
    {
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, LeaveRequest, Availability, Shift, Schedule, Company],
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