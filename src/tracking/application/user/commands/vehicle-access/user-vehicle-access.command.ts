import { ICommand } from '@nestjs/cqrs';

export class UpdateUserVehicleAccessCommand implements ICommand {
    constructor(
        public readonly userId: number,
        public readonly accessToAllVehicles: boolean
    ) {}
}