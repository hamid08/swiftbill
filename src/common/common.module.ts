import { Module } from "@nestjs/common";
import { MongoModule, RmqModule, SocketIoModule } from "./infrastructure";
import { GridUtilsService } from "./application";
import { AuthenticationGuard, AuthorizationGuard, AuthGuard } from "./application/guards";
@Module({
    imports: [
        RmqModule,
        MongoModule,
        SocketIoModule
    ],
    controllers: [],
    providers: [
        GridUtilsService,
        AuthenticationGuard,
        AuthorizationGuard,
        AuthGuard

    ],
    exports: [
        GridUtilsService,
        AuthenticationGuard,
        AuthorizationGuard,
        AuthGuard

    ],
})
export class CommonModule { }
