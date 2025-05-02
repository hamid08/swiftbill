import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateUserVehicleAccessCommand } from "./user-vehicle-access.command";
import { UserError, UserRepository } from "src/tracking/domain";
import { AppException } from "src/common";


@CommandHandler(UpdateUserVehicleAccessCommand)
export class UpdateUserVehicleAccessCommandHandler implements ICommandHandler<UpdateUserVehicleAccessCommand, void> {
    private readonly logger = new Logger(UpdateUserVehicleAccessCommandHandler.name);

    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,

    ) { }

    async execute(command: UpdateUserVehicleAccessCommand): Promise<void> {

        const user = await this.userRepository.getByUserId(command.userId);

        if (!user) {
            throw AppException.BadRequest(UserError.UserNotFound);
        }

        await this.userRepository.updateVehicleAccess(command.userId, command.accessToAllVehicles);
    }
}