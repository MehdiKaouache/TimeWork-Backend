import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateLoginDTO {

  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail({}, { message: 'Please provide a valid new email address' })
  @MaxLength(255)
  newEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(50)
  newPassword?: string;
}