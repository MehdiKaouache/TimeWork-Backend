// src/super-admin/dto/provision-company.dto.ts
import { IsString, IsEmail, IsObject, IsArray, IsNumber } from 'class-validator';

export class ProvisionCompanyDto {
  @IsString()
  companyName: string;

  @IsObject()
  operatingHours: Record<string, { open: string; close: string; isOpen: boolean }>;

  @IsArray()
  roles: {
    title: string;
    baseHourlyRate: number;
    staffingNeeds: Record<string, number>; // { monday: 2, friday: 5 }
  }[];

  @IsEmail()
  managerEmail: string;

  @IsString()
  managerFirstName: string;

  @IsString()
  managerLastName: string;
}