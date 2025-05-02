import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { 
    MinimalLocationB1, 
    TrackerAssignmentError, 
    TrackingExtensionError, 
    TrackingExtensionRepository,
    TrackerAssignmentRepository
} from 'src/tracking/domain';
import { AppException } from 'src/common';
import { GetExtensionLatestLocationQuery } from './get-extension-latest-location.query';


@QueryHandler(GetExtensionLatestLocationQuery)
export class GetExtensionLatestLocationQueryHandler 
    implements IQueryHandler<GetExtensionLatestLocationQuery, MinimalLocationB1> {

    constructor(
        @Inject(TrackingExtensionRepository)
        private readonly trackingExtensionRepo: TrackingExtensionRepository,
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepo: TrackerAssignmentRepository,
    ) {}

    async execute(query: GetExtensionLatestLocationQuery): Promise<MinimalLocationB1> {
        await this.validateInputs(query);
        
        const extensionLocation = await this.trackingExtensionRepo
            .getLatestLocation(query.trackingExtensionId);
        
        if (extensionLocation) {
            return extensionLocation;
        }

        return this.getFallbackLocation(query.trackingAssignmentId);
    }

    private async validateInputs(query: GetExtensionLatestLocationQuery): Promise<void> {
        const [assignmentExists, extensionExists] = await Promise.all([
            this.trackerAssignmentRepo.existsTrackerAssignment(query.trackingAssignmentId),
            this.trackingExtensionRepo.existsTrackingExtension(query.trackingExtensionId)
        ]);

        if (!assignmentExists) {
            throw AppException.BadRequest(TrackerAssignmentError.TrackerAssignmentNotFound);
        }

        if (!extensionExists) {
            throw AppException.BadRequest(TrackingExtensionError.TRACKING_EXTENSION_NOT_FOUND);
        }
    }

    private async getFallbackLocation(assignmentId: number): Promise<MinimalLocationB1> {
        const fallbackLocation = await this.trackerAssignmentRepo
            .getLatestLocation(assignmentId);

        if (!fallbackLocation) {
           return new MinimalLocationB1();
        }

        return fallbackLocation;
    }
}