import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ViolationTrackedRouteQuery } from "./violation-tracked-route.query";
import { AppException, DateTimeUtils } from "src/common";
import {
    TrackerAssignment, TrackerAssignmentError, TrackerAssignmentRepository,
    TrackingDataRepository, Violation, ViolationError,
    ViolationRepository, ViolationTrackedRouteResponseDto
} from "src/tracking/domain";


@QueryHandler(ViolationTrackedRouteQuery)
export class ViolationTrackedRouteQueryHandler
    implements IQueryHandler<ViolationTrackedRouteQuery, ViolationTrackedRouteResponseDto[]> {
    private readonly logger = new Logger(ViolationTrackedRouteQueryHandler.name);

    constructor(
        @Inject(ViolationRepository)
        private readonly violationRepository: ViolationRepository,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(TrackingDataRepository)
        private readonly trackingDataRepository: TrackingDataRepository,
    ) { }

    async execute(query: ViolationTrackedRouteQuery): Promise<ViolationTrackedRouteResponseDto[]> {
        const { violationId, trackerAssignmentId, pageIndex } = query;

        const violations: Violation | null = await this.violationRepository.getByViolationId(violationId);

        if (!violations) {
            throw AppException.BadRequest(ViolationError.ViolationNotFound);
        }

        const trackerAssignment: TrackerAssignment | null = await this.trackerAssignmentRepository.getByTrackerAssignmentId(trackerAssignmentId);
        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        let pageSize = 2000;

        let fromDate: Date = violations.getStartDate();
        let toDate: Date | undefined = violations.getEndDate();

        var result = await this.trackingDataRepository
            .getViolationTrackedRouteData(pageIndex, pageSize, trackerAssignment.getTerminalNumber(), fromDate, toDate);

        return result;
    }

}