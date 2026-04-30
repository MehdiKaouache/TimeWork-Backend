import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notifications.entity';
import { User } from '../../users/entities/user.entity';
import { IObserver } from '../interfaces/observer.interface';
import { NotificationType } from '../enums/notification-type.enum';

@Injectable()
export class DatabaseObserver implements IObserver { constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async update(userId: number | null, type: NotificationType, data: any): Promise<void> {
    if (userId === null) {
      const users = await this.userRepo.find();
      
      const notifications = users.map((user) => {
        const { title, message } = this.generateNotificationMessage(type, data);
        return this.notificationRepo.create({
          userId: user.id,
          type,
          title,
          message,
          metadata: data,
        });
      });

      await this.notificationRepo.save(notifications);
    } else {
      const { title, message } = this.generateNotificationMessage(type, data);
      
      const notification = this.notificationRepo.create({
        userId,
        type,
        title,
        message,
        metadata: data,
      });

      await this.notificationRepo.save(notification);
    }
  }


  private generateNotificationMessage(type: NotificationType, data: any): { title: string; message: string } {
    switch (type) {
      case NotificationType.ACCOUNT_CREATED:
        return {
          title: "Bienvenue !",
          message: "Votre compte a été créé.",
        };
      case NotificationType.ACCOUNT_APPROVED:
        return {
          title: "Compte activé",
          message: "Votre accès à l’application a été validé.",
        };
      case NotificationType.LEAVE_REQUEST_PENDING:
        return {
          title: "Nouveau shift disponible",
          message: `Demande de congé pour le ${data.date}.`,
        };
      case NotificationType.LEAVE_REQUEST_APPROVED:
        return {
          title: "Congé validé",
          message: `Demande de congé pour le ${data.date} a été acceptée.`,
        };
      case NotificationType.LEAVE_REQUEST_REJECTED:
        return {
          title: "Congé refusé",
          message: `Demande de congé pour le ${data.date} a été refusée.`,
        };
      case NotificationType.SHIFT_EXCHANGE_ACCEPTED:
        return {
          title: "Échange confirmé",
          message: `L'échange de shift pour le ${data.date} a été validé.`,
        };
      case NotificationType.SHIFT_EXCHANGE_REJECTED:
        return {
          title: "Échange refusé",
          message: `L"échange de shift pour le ${data.date} a été refusée.`,
        };
      default:
        return {
          title: "Mise à jour système",
          message: "Vous avez reçu une nouvelle notification.",
        };
    }
  }
}