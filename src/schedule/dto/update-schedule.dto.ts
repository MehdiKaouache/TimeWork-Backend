import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateScheduleDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;
}