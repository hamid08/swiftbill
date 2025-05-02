import { IQuery } from "@nestjs/cqrs";
import { AppException } from "src/common";

export class TrackingDeviceCheckByImeiQuery implements IQuery {
    constructor(public readonly imei: string) { 
        if (!imei) {
            throw AppException.BadRequest('IMEI is required');
        }
    }
}