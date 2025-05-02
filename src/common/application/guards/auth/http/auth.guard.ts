import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthenticationGuard } from "./authentication.guard";
import { AuthorizationGuard } from "./authorization.guard";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly authenticationGuard: AuthenticationGuard,
        private readonly authorizationGuard: AuthorizationGuard
    ) { }

    canActivate(context: ExecutionContext): boolean {
        return this.authenticationGuard.canActivate(context) &&
            this.authorizationGuard.canActivate(context);
    }
}