import { 
  IsEmail, 
  IsNotEmpty, 
  IsString
} from 'class-validator';

import { Transform } from 'class-transformer';

export class SigninDTO {

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail({}, { message: 'Please provide a valid email address format' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}