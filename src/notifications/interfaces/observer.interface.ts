import { NotificationType } from '../enums/notification-type.enum';

export interface IObserver {
  update(userId: number | null, type: NotificationType, data: any): Promise<void>;
}