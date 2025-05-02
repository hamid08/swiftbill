import { Inject, Injectable, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppException, GridViewDto } from "src/common";
import { TrackerAssignmentError, TrackerAssignmentRepository, TripGridResponseDto, TripRepository, ViolationRepository } from "src/tracking/domain";
import { TripGridQuery } from "./trip-grid.query";


@QueryHandler(TripGridQuery)
export class TripGridQueryHandler
    implements IQueryHandler<TripGridQuery, GridViewDto<TripGridResponseDto>> {
    private readonly logger = new Logger(TripGridQueryHandler.name);

    constructor(
        @Inject(TripRepository)
        private readonly tripRepository: TripRepository,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(ViolationRepository)
        private readonly violationRepository: ViolationRepository,
    ) { }

    async execute(query: TripGridQuery): Promise<GridViewDto<TripGridResponseDto>> {
        const trackerAssignment = await this.trackerAssignmentRepository.getByTrackerAssignmentId(query.trackerAssignmentId);

        if (!trackerAssignment) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        const grid = await this.tripRepository.getGrid(query.filter, trackerAssignment.getTrackerId(), query.fromDate, query.toDate);
        
        grid.list = await Promise.all(grid.list.map(async item => {
            const violationCount = await this.violationRepository.getViolationCountWithDateRange(
                trackerAssignment.getId(), 
                item.startTrip, 
                item.endTrip || new Date()
            );
            return {
                ...item,
                violationCount
            };
        }));

        return grid;
    }
}