import { Module, Global, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notifications.entity';
import { User } from '../users/entities/user.entity';
import { SMSObserver } from './observers/sms.observer';
import { DatabaseObserver } from './observers/database.observer';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  providers: [
    NotificationsService,
    SMSObserver,
    DatabaseObserver,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule implements OnModuleInit { constructor(
    private readonly notificationsService: NotificationsService,
    private readonly smsObserver: SMSObserver,
    private readonly databaseObserver: DatabaseObserver,
  ) {}

  onModuleInit() {
    this.notificationsService.subscribe(this.smsObserver);

    this.notificationsService.subscribe(this.databaseObserver);
  }
}