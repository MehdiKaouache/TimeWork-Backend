import { IObserver } from '../interfaces/observer.interface';
import { NotificationType } from '../enums/notification-type.enum';

// L'implementation fait du sens il ne me reste plus qu'a faire en sorte de vraiment envoyer par SMS
export class SMSObserver implements IObserver {
  async update(userId: number | null, type: NotificationType, data: any): Promise<void> {
    if (userId === null) {
      console.log(`[Message pour tout le monde] Sms groupé pour : ${type}`);
    } else {
      console.log(`[Message solo] Envoi d'un sms à l'utilisateur ${userId}`);
    }
  }
}