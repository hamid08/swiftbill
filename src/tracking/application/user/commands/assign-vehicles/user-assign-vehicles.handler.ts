import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserError, UserRepository, UserVehicleAccessRepository } from "src/tracking/domain";
import { AppException } from "src/common";
import { UserAssignVehiclesCommand } from "./user-assign-vehicles.command";


@CommandHandler(UserAssignVehiclesCommand)
export class UserAssignVehiclesCommandHandler implements ICommandHandler<UserAssignVehiclesCommand, void> {
    private readonly logger = new Logger(UserAssignVehiclesCommandHandler.name);

    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,

        @Inject(UserVehicleAccessRepository)
        private readonly userVehicleAccessRepository: UserVehicleAccessRepository,

    ) { }

    async execute(command: UserAssignVehiclesCommand): Promise<void> {

        const user = await this.userRepository.getByUserId(command.userId);

        if (!user) {
            throw AppException.BadRequest(UserError.UserNotFound);
        }

        await this.userVehicleAccessRepository.assignVehicleToUser(command.userId, command.vehicleIds);

    }
}