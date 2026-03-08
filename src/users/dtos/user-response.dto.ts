import { Expose } from "class-transformer";

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
  role: string;

  @Expose()
  hourlyRate: number;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;
}