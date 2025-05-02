import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedRequest, JwtPayload } from "../guards";

export const AuthUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): JwtPayload => {
        const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
        return request.user;
    }
);