import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  MaxLength, 
  Matches 
} from 'class-validator';

import { Transform } from 'class-transformer';
import { PASSWORD_REGEX } from 'src/common/constants/regex.constants';

export class SignupDTO {

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password is too short (minimum 8 characters)' })
  @MaxLength(50)
  // Ajoute d'une règle pour forcer au moins une majuscule et un chiffre
  @Matches(PASSWORD_REGEX, {
    message: 'Password is too weak. It must contain at least one uppercase letter and one number or special character.',
  })
  password: string;
}