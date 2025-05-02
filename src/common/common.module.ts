import { Module } from "@nestjs/common";
import { MongoModule, RmqModule } from "./infrastructure";
import { GridUtilsService } from "./application";
@Module({
    imports: [
        RmqModule,
        MongoModule,
    ],
    controllers: [],
    providers: [
        GridUtilsService,
        

    ],
    exports: [
        GridUtilsService,
       

    ],
})
export class CommonModule { }
