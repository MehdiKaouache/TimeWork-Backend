import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}