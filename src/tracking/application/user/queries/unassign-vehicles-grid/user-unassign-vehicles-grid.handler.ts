import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppException, GridViewDto } from "src/common";
import { UserError, UserRepository,  VehicleRepository, VehiclesUserGridResponseDto } from "src/tracking/domain";
import { UserUnassignVehiclesGridQuery } from "./user-unassign-vehicles-grid.query";


@QueryHandler(UserUnassignVehiclesGridQuery)
export class UserUnassignVehiclesGridQueryHandler
    implements IQueryHandler<UserUnassignVehiclesGridQuery, GridViewDto<VehiclesUserGridResponseDto>> {
    private readonly logger = new Logger(UserUnassignVehiclesGridQueryHandler.name);

    constructor(
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
        @Inject(VehicleRepository)
        private readonly vehicleRepository: VehicleRepository,
    ) { }

    async execute(query: UserUnassignVehiclesGridQuery): Promise<GridViewDto<VehiclesUserGridResponseDto>> {

        const { userId, businessExternalId, filter } = query;
        const user = await this.userRepository.getByUserId(userId);

        if (!user) {
            throw AppException.BadRequest(UserError.UserNotFound);
        }

        return await this.vehicleRepository.unassignVehiclesGrid(filter, userId, businessExternalId);
    }

}