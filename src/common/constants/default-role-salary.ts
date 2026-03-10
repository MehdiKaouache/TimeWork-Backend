import { UserRole } from "../enums/user-roles.enum";

export const DEFAULT_ROLE_SALARY: Record<UserRole, number> = {
  [UserRole.MANAGER]: 35,
  [UserRole.ASSISTANT_MANAGER]: 28,
  [UserRole.EMPLOYEE]: 24,
  [UserRole.NEW_HIRE]: 19,
  [UserRole.TRAINEE]: 16
};