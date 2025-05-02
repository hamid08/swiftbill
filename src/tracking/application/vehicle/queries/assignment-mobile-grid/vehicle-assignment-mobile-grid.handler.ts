import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppException, GridViewDto } from "src/common";
import { VehicleRepository, VehicleAssignmentMobileGridResponseDto, TrackingModelRepository, TrackingModelError } from "src/tracking/domain";
import { VehicleAssignmentMobileGridQuery } from "./vehicle-assignment-mobile-grid.query";


@QueryHandler(VehicleAssignmentMobileGridQuery)
export class VehicleAssignmentMobileGridQueryHandler
    implements IQueryHandler<VehicleAssignmentMobileGridQuery, GridViewDto<VehicleAssignmentMobileGridResponseDto>> {
    private readonly logger = new Logger(VehicleAssignmentMobileGridQueryHandler.name);

    constructor(
        @Inject(VehicleRepository)
        private readonly vehicleRepository: VehicleRepository,
        @Inject(TrackingModelRepository)
        private readonly trackingModelRepository: TrackingModelRepository,
    ) { }

    async execute(query: VehicleAssignmentMobileGridQuery): Promise<GridViewDto<VehicleAssignmentMobileGridResponseDto>> {
        const mobileModelId = await this.trackingModelRepository.getMobileModelId();
        if (!mobileModelId) {
            throw AppException.BadRequest(TrackingModelError.MobileModelNotFound);
        }
        return await this.vehicleRepository.vehiclesMobileGrid(query.filter, query.businessExternalId, mobileModelId);
    }

}