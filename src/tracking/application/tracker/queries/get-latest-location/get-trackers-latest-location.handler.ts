import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
    ApplicationSettingRepository,
    TrackerLatestLocationDto,
    TrackerRepository,
    UserAccessibleDto,
    UserRepository
} from "src/tracking/domain";
import { GetTrackersLatestLocationQuery } from "./get-trackers-latest-location.query.js";

@QueryHandler(GetTrackersLatestLocationQuery)
export class GetTrackersLatestLocationQueryHandler
    implements IQueryHandler<GetTrackersLatestLocationQuery, TrackerLatestLocationDto[]> {

    private readonly logger = new Logger(GetTrackersLatestLocationQueryHandler.name);

    constructor(
        @Inject(TrackerRepository)
        private readonly trackerRepository: TrackerRepository,
        @Inject(ApplicationSettingRepository)
        private readonly applicationSettingRepository: ApplicationSettingRepository,
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
    ) { }

    async execute(query: GetTrackersLatestLocationQuery): Promise<TrackerLatestLocationDto[]> {

        const [userAccessibles, minToDetectIsOnline] = await Promise.all([
            this.getUserAccessibles(query.userExternalId),
            this.getMinTimeToDetectOnline(),
        ]);

        if (!userAccessibles.accessToAllVehicles && 
            !userAccessibles.accessibleVehicles?.length) {
            return [];
        }

        const trackers = await this.trackerRepository.getTrackersLatestLocation(userAccessibles,query.businessExternalId, minToDetectIsOnline);
        return trackers;
    }

    private async getUserAccessibles(userExternalId: string): Promise<UserAccessibleDto> {
        try {
            const userAccessibles = await this.userRepository.getUserAccessibles(userExternalId);
            return userAccessibles ?? this.getDefaultUserAccessibles();
        } catch (error) {
            this.logger.error(`Error getting user accessibles for user ${userExternalId}`, error.stack);
            return this.getDefaultUserAccessibles();
        }
    }

    private getDefaultUserAccessibles(): UserAccessibleDto {
        return {
            accessToAllVehicles: false,
            accessibleVehicles: [],
        };
    }

    private async getMinTimeToDetectOnline(): Promise<number> {
        try {
            const applicationSettings = await this.applicationSettingRepository.getApplicationSetting();
            return applicationSettings?.getMinTimeToDetectConnectedTracker() ?? this.getDefaultMinTime();
        } catch (error) {
            this.logger.error('Error getting min time to detect online', error.stack);
            return this.getDefaultMinTime();
        }
    }

    private getDefaultMinTime(): number {
        return 5; // Default value in minutes
    }


}