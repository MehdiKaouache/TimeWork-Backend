import { 
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength ,
  Matches
} from 'class-validator';

import { Transform } from 'class-transformer';
import { PASSWORD_REGEX } from 'src/common/constants/regex.constants';

export class UpdateLoginDTO {

  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Please provide a valid new email address' })
  @MaxLength(255)
  newEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password is too short (minimum 8 characters)' })
  @MaxLength(50)
  // Ajoute d'une règle pour forcer au moins une majuscule et un chiffre
  @Matches(PASSWORD_REGEX, {
    message: 'New password is too weak.',
  })
  newPassword?: string;
}