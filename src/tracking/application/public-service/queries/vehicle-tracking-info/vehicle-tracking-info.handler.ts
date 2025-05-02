import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
    GetVehicleTrackingInfoResponseDto,
    TrackerRepository,
} from "src/tracking/domain";
import { GetVehicleTrackingInfoQuery } from "./vehicle-tracking-info.query";

@QueryHandler(GetVehicleTrackingInfoQuery)
export class GetVehicleTrackingInfoQueryHandler
    implements IQueryHandler<GetVehicleTrackingInfoQuery, GetVehicleTrackingInfoResponseDto[]> {

    private readonly logger = new Logger(GetVehicleTrackingInfoQueryHandler.name);

    constructor(
        @Inject(TrackerRepository)
        private readonly trackerRepository: TrackerRepository,
    ) { }

    async execute(query: GetVehicleTrackingInfoQuery): Promise<GetVehicleTrackingInfoResponseDto[]> {

        const results = await this.trackerRepository.getVehicleTrackingInfo(query.vehicleIds);

        return results || [];

    }
}