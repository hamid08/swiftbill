import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
    ApplicationSettingRepository,
    TrackerRepository,
} from "src/tracking/domain";
import { AppConfigService } from "src/config";
import { GetNearbyVehicleQuery } from "./get-nearby-vehicle.query";
import { NearbyTrackerResponseDto } from "src/tracking/domain";

@QueryHandler(GetNearbyVehicleQuery)
export class GetNearbyVehicleQueryHandler
    implements IQueryHandler<GetNearbyVehicleQuery, NearbyTrackerResponseDto> {

    private readonly logger = new Logger(GetNearbyVehicleQueryHandler.name);

    constructor(
        @Inject(TrackerRepository)
        private readonly trackerRepository: TrackerRepository,
        @Inject(ApplicationSettingRepository)
        private readonly applicationSettingRepository: ApplicationSettingRepository,
        private readonly appConfigService: AppConfigService,
    ) { }

    async execute(query: GetNearbyVehicleQuery): Promise<NearbyTrackerResponseDto> {

        const minToDetectIsOnline = await this.getMinTimeToDetectOnline();
        const results = await this.trackerRepository.findNearbyTrackers(query.dto, minToDetectIsOnline);

        return results;

    }

    private async getMinTimeToDetectOnline(): Promise<number> {
        const applicationSettings = await this.applicationSettingRepository.getApplicationSetting();
        return applicationSettings?.getMinTimeToDetectConnectedTracker() ?? 5;
    }


}