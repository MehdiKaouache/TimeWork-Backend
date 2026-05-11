import { IObserver } from '../interfaces/observer.interface';
import { NotificationType } from '../enums/notification-type.enum';
import twilio from 'twilio';

export class SMSObserver implements IObserver {
  private client: twilio.Twilio;
  private readonly fromNumber: string;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
  }

  async update(userId: number | null, type: NotificationType, data: any): Promise<void> {
    try {
      const messageBody = this.getMessageContent(type, data);
      
      if (userId === null) {
        console.log(`[SMS Broadcast] ${messageBody}`);
      } else {
        const userPhone = await this.getUserPhoneNumber(userId);

        if (userPhone) {
          await this.client.messages.create({
            body: messageBody,
            from: this.fromNumber,
            to: userPhone
          });
          console.log(`[SMS] Envoyé à l'utilisateur ${userId} pour: ${type}`);
        }
      }
    } catch (error) {
      console.error(`[SMS Error] Impossible d'envoyer la notification ${type}:`, error);
    }
  }

  private getMessageContent(type: NotificationType, data: any): string {
    switch (type) {
      case NotificationType.ACCOUNT_CREATED:
        return `Bienvenue ! Votre compte a été créé avec succès.`;
      case NotificationType.ACCOUNT_APPROVED:
        return `Bonne nouvelle ! Votre compte a été approuvé.`;
      case NotificationType.LEAVE_REQUEST_PENDING:
        return `Votre demande de congé pour le ${data.date} est en attente de validation.`;
      case NotificationType.LEAVE_REQUEST_APPROVED:
        return `Votre demande de congé a été APPROUVÉE. Profitez bien !`;
      case NotificationType.LEAVE_REQUEST_REJECTED:
        return `Votre demande de congé a été refusée.'}.`;
      case NotificationType.SHIFT_EXCHANGE_ACCEPTED:
        return `L'échange de shift a été accepté !`;
      case NotificationType.SHIFT_EXCHANGE_REJECTED:
        return `L'échange de shift a été refusé.`;
      default:
        return `Vous avez une nouvelle notification concernant votre compte.`;
    }
  }

  private async getUserPhoneNumber(userId: number): Promise<string | null> {
    return "+4385261981"; 
  }
}