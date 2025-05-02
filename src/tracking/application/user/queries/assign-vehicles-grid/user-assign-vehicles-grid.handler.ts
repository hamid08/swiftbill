import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppException, GridViewDto } from "src/common";
import { UserError, UserRepository,  VehicleRepository, VehiclesUserGridResponseDto } from "src/tracking/domain";
import { UserAssignVehiclesGridQuery } from "./user-assign-vehicles-grid.query";

@QueryHandler(UserAssignVehiclesGridQuery)
export class UserAssignVehiclesGridQueryHandler
    implements IQueryHandler<UserAssignVehiclesGridQuery, GridViewDto<VehiclesUserGridResponseDto>> {
    private readonly logger = new Logger(UserAssignVehiclesGridQueryHandler.name);

    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
        @Inject(VehicleRepository)
        private readonly vehicleRepository: VehicleRepository,
    ) { }

    async execute(query: UserAssignVehiclesGridQuery): Promise<GridViewDto<VehiclesUserGridResponseDto>> {

        const { userId, businessExternalId, filter } = query;
        const user = await this.userRepository.getByUserId(userId);

        if (!user) {
            throw AppException.BadRequest(UserError.UserNotFound);
        }

        return await this.vehicleRepository.assignVehiclesGrid(filter, userId, businessExternalId);
    }

}