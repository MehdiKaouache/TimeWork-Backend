import { Injectable } from '@nestjs/common';
import { IObserver } from './interfaces/observer.interface';
import { NotificationType } from './enums/notification-type.enum';

@Injectable()
export class NotificationsService {
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
}