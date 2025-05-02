import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackingExtensionError, TrackingExtensionMinimalInfoDto, TrackingExtensionRepository } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { GetTrackingExtensionByIdQuery } from './get-tracking-extension-by-id.query';
import { AppException } from 'src/common';


@QueryHandler(GetTrackingExtensionByIdQuery)
export class GetTrackingExtensionByIdQueryHandler implements IQueryHandler<GetTrackingExtensionByIdQuery, TrackingExtensionMinimalInfoDto> {
    constructor(
        @Inject(TrackingExtensionRepository)
        private readonly trackingExtensionRepository: TrackingExtensionRepository,
    ) { }

    async execute(query: GetTrackingExtensionByIdQuery): Promise<TrackingExtensionMinimalInfoDto> {
        const trackingExtension = await this.trackingExtensionRepository.getTrackingExtensionById(query.trackingExtensionId);
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