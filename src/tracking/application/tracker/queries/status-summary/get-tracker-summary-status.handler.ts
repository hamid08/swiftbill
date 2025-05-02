import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GridViewDto } from "src/common";
import {
    ApplicationSetting,
    ApplicationSettingRepository,
    TrackerGridResponseDto,
    TrackerRepository,
    TrackerSummaryStatusDto,
    UserAccessibleDto,
    UserRepository
} from "src/tracking/domain";
import { AppConfigService } from "src/config";
import { GetTrackerSummaryStatusQuery } from "./get-tracker-summary-status.query";

@QueryHandler(GetTrackerSummaryStatusQuery)
export class GetTrackerSummaryStatusQueryHandler
    implements IQueryHandler<GetTrackerSummaryStatusQuery, TrackerSummaryStatusDto> {

    private readonly logger = new Logger(GetTrackerSummaryStatusQueryHandler.name);

    constructor(
        @Inject(TrackerRepository)
        private readonly trackerRepository: TrackerRepository,
        @Inject(ApplicationSettingRepository)
        private readonly applicationSettingRepository: ApplicationSettingRepository,
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
        private readonly appConfigService: AppConfigService,
    ) { }

    async execute(query: GetTrackerSummaryStatusQuery): Promise<TrackerSummaryStatusDto> {
        const { businessExternalId, userExternalId } = query;

        const [userAccessibles, minToDetectIsOnline] = await Promise.all([
            this.getUserAccessibles(userExternalId),
            this.getMinTimeToDetectOnline(),
        ]);

        if (!userAccessibles.accessToAllVehicles &&
            !userAccessibles.accessibleVehicles?.length) {
            return this.emptyResponse();
        }

        return await this.trackerRepository.getTrackerSummaryStatus(
            userAccessibles,
            businessExternalId,
            minToDetectIsOnline,
        );

    }

    private emptyResponse(): TrackerSummaryStatusDto {
        return {
            lastUpdated: new Date(),
            movingCount: 0,
            offlineCount: 0,
            onlineCount: 0,
            poweredOffCount: 0,
            poweredOnCount: 0,
            stoppedCount: 0,
            totalCount: 0,
            violationsCount: 0
        };
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
        const applicationSettings = await this.applicationSettingRepository.getApplicationSetting();
        return applicationSettings?.getMinTimeToDetectConnectedTracker() ?? 5;
    }

}