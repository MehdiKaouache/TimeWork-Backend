import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, Matches, ValidateIf } from "class-validator";
import { DayOfWeek } from "src/common/enums/day-of-week.enum";

export class CreateAvailabilityDto {
    @IsEnum(DayOfWeek)
    @IsNotEmpty()
    dayOfWeek: DayOfWeek;

    @IsBoolean()
    @ValidateIf(o => o.isAllDay === undefined) // isAvailable is required if isAllDay is not provided
    isAvailable?: boolean;

    @IsBoolean()
    @ValidateIf(o => o.isAvailable === undefined) // isAllDay is required if isAvailable is not provided
    isAllDay?: boolean;

    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
    startTime?: string;

    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm format' })
    endTime?: string;
}
