import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateLoginDTO {

  @IsString()
  currentPassword: string;

  @IsOptional()
  @IsEmail()
  newEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  newPassword?: string;

}