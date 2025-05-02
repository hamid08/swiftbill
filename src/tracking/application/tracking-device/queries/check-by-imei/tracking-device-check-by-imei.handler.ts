import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TrackingDeviceCheckByImeiResponse, TrackingDeviceRepository, TrackerAssignmentRepository, TrackerAssignment, TrackingDeviceError } from 'src/tracking/domain';
import { Inject } from '@nestjs/common';
import { TrackingDeviceCheckByImeiQuery } from './tracking-device-check-by-imei.query';
import { TrackingDeviceCheckByImeiResponseDto } from 'src/tracking/domain';

@QueryHandler(TrackingDeviceCheckByImeiQuery)
export class TrackingDeviceCheckByImeiQueryHandler implements IQueryHandler<TrackingDeviceCheckByImeiQuery, TrackingDeviceCheckByImeiResponseDto> {
    constructor(
        @Inject(TrackingDeviceRepository)
        private readonly trackingDeviceRepository: TrackingDeviceRepository,
    ) { }

    async execute(query: TrackingDeviceCheckByImeiQuery): Promise<TrackingDeviceCheckByImeiResponseDto> {
        const trackingDevice: TrackingDeviceCheckByImeiResponse | null = await this.trackingDeviceRepository.checkByImei(query.imei);
        if (!trackingDevice) {
            return {
                isExists: false,
            }
        }
        return {
            isExists: true,
            deviceInfo: {
                imei: trackingDevice.imei,
                serialNumber: trackingDevice.serialNumber,
                simNumber: trackingDevice.simNumber,
                remotePassword: trackingDevice.remotePassword,
                identity: trackingDevice.identity,
                modelId: trackingDevice.modelId,
                brandId: trackingDevice.brandId,
            }
        }
    }
}   