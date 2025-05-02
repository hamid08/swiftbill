import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserError, UserRepository, UserVehicleAccessRepository } from "src/tracking/domain";
import { AppException } from "src/common";
import { UserUnassignVehiclesCommand } from "./unassign-vehicles.command";


@CommandHandler(UserUnassignVehiclesCommand)
export class UserUnassignVehiclesCommandHandler implements ICommandHandler<UserUnassignVehiclesCommand, void> {
    private readonly logger = new Logger(UserUnassignVehiclesCommandHandler.name);

    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,

        @Inject(UserVehicleAccessRepository)
        private readonly userVehicleAccessRepository: UserVehicleAccessRepository,

    ) { }

    async execute(command: UserUnassignVehiclesCommand): Promise<void> {

        const user = await this.userRepository.getByUserId(command.userId);

        if (!user) {
            throw AppException.BadRequest(UserError.UserNotFound);
        }

        await this.userVehicleAccessRepository.unassignVehicleFromUser(command.userId, command.vehicleIds);

    }
}