import { CanActivate } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";

export class AdminGuard implements CanActivate {

    canActivate(context: ExecutionContext) {
        //si il s'agit d'un admin
        const request = context.switchToHttp().getRequest();
        return request.currentUser.admin;
    }
}