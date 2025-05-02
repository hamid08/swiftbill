import { IQuery } from '@nestjs/cqrs';

export class GetDeviceTracingResultQuery implements IQuery {
    constructor(public readonly imei: string) { }
}