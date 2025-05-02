import { Module } from "@nestjs/common";
import { MongoModule, RmqModule } from "./infrastructure";
@Module({
    imports: [
        RmqModule,
        MongoModule,
    ],
    controllers: [],
    providers: [
        

    ],
    exports: [
       

    ],
})
export class CommonModule { }
