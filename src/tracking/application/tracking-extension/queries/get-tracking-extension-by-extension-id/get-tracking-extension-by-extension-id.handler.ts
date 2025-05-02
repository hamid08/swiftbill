import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackingExtensionError, TrackingExtensionRepository, TrackingExtensionMinimalInfoDto } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { AppException } from 'src/common';
import { GetTrackingExtensionByExtensionIdQuery } from './get-tracking-extension-by-extension-id.query';


@QueryHandler(GetTrackingExtensionByExtensionIdQuery)
export class GetTrackingExtensionByExtensionIdQueryHandler implements IQueryHandler<GetTrackingExtensionByExtensionIdQuery, TrackingExtensionMinimalInfoDto> {
    constructor(
        @Inject(TrackingExtensionRepository)
        private readonly trackingExtensionRepository: TrackingExtensionRepository,
    ) { }

    async execute(query: GetTrackingExtensionByExtensionIdQuery): Promise<TrackingExtensionMinimalInfoDto> {
        const trackingExtension = await this.trackingExtensionRepository.getTrackingExtensionByExtensionId(query.extensionId);
        if (!trackingExtension) {
            throw AppException.BadRequest(TrackingExtensionError.TRACKING_EXTENSION_NOT_FOUND);
        }
        return {
            caption: trackingExtension.getCaption(),
            description: trackingExtension.getDescription(),
            extensionId: trackingExtension.getExtensionId(),
        }
    }
}   