import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppException } from "src/common";
import {
    TrackerAssignment,
    TrackerAssignmentError,
    TrackerAssignmentRepository,
    ViolationRepository,
    TripRepository,
    CurrentTripInfoDto
} from "src/tracking/domain";
import { GetCurrentTripInfoQuery } from "./get-current-trip-info.query";

@Injectable()
@QueryHandler(GetCurrentTripInfoQuery)
export class GetCurrentTripInfoQueryHandler
    implements IQueryHandler<GetCurrentTripInfoQuery, CurrentTripInfoDto | null> {

    private readonly logger = new Logger(GetCurrentTripInfoQueryHandler.name);

    constructor(
        @Inject(ViolationRepository)
        private readonly violationRepository: ViolationRepository,
        @Inject(TripRepository)
        private readonly tripRepository: TripRepository,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
    ) { }

    async execute(query: GetCurrentTripInfoQuery): Promise<CurrentTripInfoDto | null> {
        const trackerAssignment = await this.validateTrackerAssignment(query.trackerAssignmentId);
        const currentTripInfo = await this.getCurrentTripInfo(trackerAssignment.getTrackerId());

        if (!currentTripInfo) {
            return null;
        }

        currentTripInfo.violationCount = await this.getViolationCount(
            trackerAssignment.getId(),
            currentTripInfo.startTrip,
            currentTripInfo.endTrip
        );

        return currentTripInfo;
    }

    private async validateTrackerAssignment(trackerAssignmentId: number): Promise<TrackerAssignment> {
        const trackerAssignment = await this.trackerAssignmentRepository
            .getByTrackerAssignmentId(trackerAssignmentId);

        if (!trackerAssignment) {
            this.logger.warn(`Tracker assignment not found: ${trackerAssignmentId}`);
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        return trackerAssignment;
    }

    private async getCurrentTripInfo(trackerId: number): Promise<CurrentTripInfoDto | null> {
        const tripInfo = await this.tripRepository.findCurrentTripInfo(trackerId);

        if (!tripInfo) {
            this.logger.debug(`No current trip found for tracker: ${trackerId}`);
            return null;
        }

        return tripInfo;
    }

    private async getViolationCount(
        assignmentId: number,
        startDate: Date,
        endDate?: Date
    ): Promise<number> {
        try {
            return await this.violationRepository.getViolationCountWithDateRange(
                assignmentId,
                startDate,
                endDate || new Date()
            );
        } catch (error) {
            this.logger.error(
                `Failed to get violation count for assignment ${assignmentId}: ${error.message}`,
                error.stack
            );
            return 0;
        }
    }
}