import { Inject, Injectable, Logger } from "@nestjs/common";
import { ViolationGridQuery } from "./violation-grid.query";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppException, GridViewDto } from "src/common";
import { TripError, TripRepository, ViolationGridResponseDto, ViolationRepository } from "src/tracking/domain";


@QueryHandler(ViolationGridQuery)
export class ViolationGridQueryHandler
    implements IQueryHandler<ViolationGridQuery, GridViewDto<ViolationGridResponseDto>> {
    private readonly logger = new Logger(ViolationGridQueryHandler.name);

    constructor(
        @Inject(ViolationRepository)
        private readonly violationRepository: ViolationRepository,

        @Inject(TripRepository)
        private readonly tripRepository: TripRepository,
    ) { }

    async execute(query: ViolationGridQuery): Promise<GridViewDto<ViolationGridResponseDto>> {

        let fromDate: Date | undefined;
        let toDate: Date | undefined;

        if (query.tripId) { //Filter by trip
            const trip = await this.tripRepository.getTripById(query.tripId);
            if (!trip) {
                throw AppException.BadRequest(TripError.TripNotFound);
            }

            fromDate = trip.getStartDate();
            toDate = trip.getEndDate() || new Date();

            //TODO:Need to test
        }

        const violations = await this.violationRepository.grid(query.filter, query.trackerAssignmentId, fromDate, toDate);
        return violations;
    }

}