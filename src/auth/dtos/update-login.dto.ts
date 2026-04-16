import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateLoginDTO {

  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsOptional()
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  newEmail?: string;

  @IsOptional()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  newPassword?: string;
}