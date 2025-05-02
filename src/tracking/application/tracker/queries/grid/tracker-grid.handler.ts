import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GridViewDto } from "src/common";
import {
    ApplicationSetting,
    ApplicationSettingRepository,
    TrackerGridResponseDto,
    TrackerRepository,
    UserAccessibleDto,
    UserRepository
} from "src/tracking/domain";
import { TrackerGridQuery } from "./tracker-grid.query";
import { AppConfigService } from "src/config";

@Injectable()
@QueryHandler(TrackerGridQuery)
export class TrackerGridQueryHandler
    implements IQueryHandler<TrackerGridQuery, GridViewDto<TrackerGridResponseDto>> {

    private readonly logger = new Logger(TrackerGridQueryHandler.name);

    constructor(
        @Inject(TrackerRepository)
        private readonly trackerRepository: TrackerRepository,
        @Inject(ApplicationSettingRepository)
        private readonly applicationSettingRepository: ApplicationSettingRepository,
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
        private readonly appConfigService: AppConfigService,
    ) { }

    async execute(query: TrackerGridQuery): Promise<GridViewDto<TrackerGridResponseDto>> {
        const {
            userExternalId,
            filter,
            businessExternalId,
            categoryViewMode,
            statusFilter,
            trackerId
        } = query;

        const [userAccessibles, minToDetectIsOnline] = await Promise.all([
            this.getUserAccessibles(userExternalId),
            this.getMinTimeToDetectOnline(),
        ]);

        if (!userAccessibles.accessToAllVehicles && 
            !userAccessibles.accessibleVehicles?.length) {
            return this.emptyGridResponse();
        }

        const vehicleAvatarUrl = this.getVehicleAvatarUrl();

        return await this.trackerRepository.getGrid(
            userAccessibles,
            businessExternalId,
            filter,
            categoryViewMode,
            statusFilter,
            vehicleAvatarUrl,
            minToDetectIsOnline,
            trackerId
        );
    }

    private emptyGridResponse(): GridViewDto<TrackerGridResponseDto> {
        return {
            list: [],
            total: 0,
            page: 1,
            size: 10,
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

    private getVehicleAvatarUrl(): string {
        return this.appConfigService.sync.singleEndpoint.url;
    }
}