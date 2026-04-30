import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsObject } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';

// Pour l'instant inutile vu que je crée les notifs en interne mais si je decide de faire en sorte que les admins peuvent envoyer de notifs personalisé se sera bien
export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsNumber()
  userId: number;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;

  @IsOptional()
  message?: string;
}