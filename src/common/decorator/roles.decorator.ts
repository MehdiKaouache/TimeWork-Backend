import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../enums/user-roles.enum";

export const ROLES_KEY = 'roles';

/**
 * A custom decorator to set the required roles for a route handler.
 * @param roles - An array of UserRole values that are allowed to access the route.
 */

export const Roles = (...roles: UserRole[]) => {
    return SetMetadata(ROLES_KEY, roles);
}