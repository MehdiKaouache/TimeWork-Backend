import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateScheduleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;
}