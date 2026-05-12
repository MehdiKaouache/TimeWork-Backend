import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsNumber,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

class UpdateRoleDto {

  @IsString()
  title: string;

  @IsNumber()
  baseHourlyRate: number;

  @IsObject()
  staffingNeeds: Record<string, number>;
}

export class UpdateCompanyDto {

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsString()
  companyPhone?: string;

  @IsOptional()
  @IsString()
  managerFirstName?: string;

  @IsOptional()
  @IsString()
  managerLastName?: string;

  @IsOptional()
  @IsString()
  managerEmail?: string;

  @IsOptional()
  @IsString()
  managerPhone?: string;

  @IsOptional()
  @IsObject()
  operatingHours?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRoleDto)
  roles?: UpdateRoleDto[];
}