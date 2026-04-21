import { IsDateString, IsEmpty, IsNotEmpty, IsNumber, Max, Min } from "class-validator";

export class CreateScheduleDto{
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(52)
    weekNumber: number;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;
}