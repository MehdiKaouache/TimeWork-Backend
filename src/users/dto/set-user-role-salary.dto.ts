import { IsEnum, IsNumber, Min } from "class-validator";
import { UserRole } from "src/common/enums/user-roles.enum";

export class SetUserRoleSalaryDTO {
    @IsEnum(UserRole)
    role: UserRole;

    @IsNumber()
    @Min(0)
    hourlyRate: number;
}