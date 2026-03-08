import { Expose } from "class-transformer";

export class UserListDto {
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
}