import { Expose } from "class-transformer";
import { UserRole } from "src/common/enums/user-roles.enum";

export class UserResponseDto {

  @Expose()
  id: number;

  @Expose()
  employeeNumber: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  role: UserRole;

  @Expose()
  hourlyRate: number;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;
}