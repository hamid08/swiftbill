import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
    IoParameterRepository,
    LocationType,
    PublicTrackingDataDto,
    TrackerAssignmentRepository
} from 'src/tracking/domain';
import { AssignmentRealtimeDataCommand, AssignmentRealtimeDataCommandModel } from './assignment-realtime-data.command';
import { AssignmentRealtimeSocketModel } from './assignment-realtime-data.dto';
import { IoElementDto, MinimalLocationB2, MinimalLocationB3 } from 'src/tracking/domain/common';
import { IoElement } from 'src/tracking/domain';
import { SOCKET_IO_CONSTANTS, SocketIoGateway } from 'src/common';
import { AppConfigService } from 'src/config';

@CommandHandler(AssignmentRealtimeDataCommand)
export class AssignmentRealtimeDataCommandHandler implements ICommandHandler<AssignmentRealtimeDataCommand, void> {
    private readonly logger = new Logger(AssignmentRealtimeDataCommandHandler.name);

    constructor(
        @Inject(TrackerAssignmentRepository)
        private readonly trackerAssignmentRepository: TrackerAssignmentRepository,
        @Inject(IoParameterRepository)
        private readonly ioParameterRepository: IoParameterRepository,
        private readonly socketGateway: SocketIoGateway,
        private readonly configService: AppConfigService
    ) { }

    async execute(command: AssignmentRealtimeDataCommand): Promise<void> {
        try {
            if (this.shouldSkipProcessing(command.data)) {
                return;
            }

            const assignmentData = await this.getAssignmentData(command.data.deviceTerminalNo);
            if (!assignmentData) {
                return;
            }

            const realtimeData = this.buildRealtimeData(command, assignmentData);
            await this.emitRealtimeData(assignmentData.assignmentId, realtimeData);

            if (this.shouldEmitToPartners()) {
                await this.emitRealtimeDataToPartners(command.data);
            }

        } catch (error) {
            this.logger.error(`Error processing realtime data`, error.stack);
        }
    }

    private shouldEmitToPartners(): boolean {
        return this.configService.partnerServices.enabled;
    }

    private shouldSkipProcessing(trackingData: AssignmentRealtimeDataCommandModel): boolean {
        return trackingData.traceMode || trackingData.locationType === LocationType.NoLocation;
    }

    private async getAssignmentData(terminalNumber: string): Promise<MinimalLocationB3 | null> {
        const assignmentData = await this.trackerAssignmentRepository
            .getDefaultAssignmentTrackingDataWithTerminalNumber(terminalNumber);

        if (!assignmentData) {
            this.logger.warn(`Tracker assignment not found for terminal ${terminalNumber}`);
            return null;
        }

        return assignmentData;
    }

    private buildRealtimeData(
        command: AssignmentRealtimeDataCommand,
        assignmentData: MinimalLocationB3
    ): AssignmentRealtimeSocketModel {
        return {
            location: this.buildLocationData(command.data),
            ioParameters: this.convertRawIoElements(command.data.ioElements), // Use provided ioElements or empty array
            speedParameterValue: command.data.speed,
            connection: {
                lastConnectedAt: assignmentData.lastConnectedAt,
                lastTrackedAt: assignmentData.lastTrackedAt
            }
        };
    }

    private convertRawIoElements(rawElements?: IoElementDto[]): IoElement[] {

        if (rawElements && rawElements.length > 0)
            // Convert raw objects to IoElement instances
            return rawElements.map(item => IoElement.create(item.key, item.value)
            );

        return [];
    }

    private buildLocationData(trackingData: AssignmentRealtimeDataCommandModel): MinimalLocationB2 {
        return {
            lat: trackingData.latitude,
            lng: trackingData.longitude,
            altitude: trackingData.altitude,
            speed: trackingData.speed,
            angle: trackingData.angle,
            locationType: trackingData.locationType || LocationType.Valid,
        };
    }

    private async emitRealtimeData(assignmentId: number, data: AssignmentRealtimeSocketModel): Promise<void> {
        try {
            data.ioParameters = await this.prepareIoParameters(data);

            this.socketGateway.emitToTarget(
                assignmentId.toString(),
                SOCKET_IO_CONSTANTS.EVENTS.TRACKER_EVENT.TRACKER_REALTIME_DATA,
                data
            );

            this.logger.debug(`Sent realtime data to socket for assignment ${assignmentId}`);
        } catch (error) {
            this.logger.error(`Failed to emit realtime data for assignment ${assignmentId}`, error.stack);
            throw error;
        }
    }

    private async emitRealtimeDataToPartners(trackingData: AssignmentRealtimeDataCommandModel): Promise<void> {
        try {
            const publicData: PublicTrackingDataDto = {
                imei: trackingData.imei,
                altitude: trackingData.altitude,
                angle: trackingData.angle,
                speed: trackingData.speed,
                lat: trackingData.latitude,
                lng: trackingData.longitude,
                date: new Date(),
                locationType: trackingData.locationType || LocationType.Valid
            };

            const partnerIds = this.configService.partnerServices.partnerIds;

            partnerIds.map(pId => {
                this.socketGateway.emitToPartner(
                    pId,
                    SOCKET_IO_CONSTANTS.EVENTS.PARTNER_EVENT.REALTIME_DATA,
                    publicData
                );
            });

            this.logger.debug(`Sent realtime data to tracking partners`);
        } catch (error) {
            this.logger.error(`Failed to emit realtime data to tracking partners`, error.stack);
        }
    }

    private async prepareIoParameters(data: AssignmentRealtimeSocketModel): Promise<IoElement[]> {
        try {
            return await this.ioParameterRepository.getTransformedIoElements(data.ioParameters);
        } catch (error) {
            this.logger.error('Parameter mapping failed in realtime', error.stack);
            return [];
        }
    }
}