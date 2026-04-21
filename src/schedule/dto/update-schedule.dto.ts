import { IsNumber, IsDateString, IsOptional, Min, Max } from 'class-validator';

export class UpdateScheduleDto {
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(52)
    weekNumber?: number;

    @IsDateString()
    @IsOptional()
    startDate?: string;
}