import { IsEmail, IsNotEmpty, IsString, IsObject, IsArray, ValidateNested, IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class JobRoleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  baseHourlyRate: number;

  @IsObject()
  staffingNeeds: Record<string, number>; // ex: { "monday": 2, "tuesday": 2... }
}

export class ProvisionCompanyDto {
  // Infos Entreprise
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsObject()
  operatingHours: Record<string, { open: string; close: string }>;

  // Infos Gérant (Le "Seed")
  @IsString()
  @IsNotEmpty()
  managerFirstName: string;

  @IsString()
  @IsNotEmpty()
  managerLastName: string;

  @IsEmail()
  managerEmail: string;

  @IsString()
  @IsNotEmpty()
  managerPhone: string;

  // Configuration des métiers
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobRoleDto)
  roles: JobRoleDto[];

  @IsString()
  @IsOptional()
  companyAddress: string;

  @IsString()
  @IsOptional()
  companyPhone: string;
}