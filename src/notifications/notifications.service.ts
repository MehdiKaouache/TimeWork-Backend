import { Injectable } from '@nestjs/common';
import { IObserver } from './interfaces/observer.interface';
import { NotificationType } from './enums/notification-type.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notifications.entity';
@Injectable()
export class NotificationsService {

  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  private observers: IObserver[] = [];

  subscribe(observer: IObserver) {
    this.observers.push(observer);
  }

  async notify(userId: number | null, type: NotificationType, data: any) {
    this.observers.forEach(observer => {
      observer.update(userId, type, data).catch(err => {
        console.error(`Erreur chez l'observateur:`, err);
      });
    });
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return await this.notificationsRepository.find({ where: { userId }, order: { createdAt: 'DESC' }});
  }

  async markAsRead(id: number): Promise<void> {
    await this.notificationsRepository.update(id, { isRead: true });
  }
  
}