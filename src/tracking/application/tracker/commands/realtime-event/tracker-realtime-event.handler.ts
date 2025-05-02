import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TrackerRealtimeEventCommand, TrackerRealtimeEventCommandModel } from './tracker-realtime-event.command';
import { SOCKET_IO_CONSTANTS, SocketIoGateway } from 'src/common';

@CommandHandler(TrackerRealtimeEventCommand)
export class TrackerRealtimeEventCommandHandler 
    implements ICommandHandler<TrackerRealtimeEventCommand, void> {
    
    private readonly logger = new Logger(TrackerRealtimeEventCommandHandler.name);

    constructor(
        private readonly socketGateway: SocketIoGateway,
    ) {}

    async execute(command: TrackerRealtimeEventCommand): Promise<void> {
        if (!command.data?.length) {
            this.logger.debug('No data to process in realtime event command');
            return;
        }

        try {
            await this.emitRealtimeEvents(command.data);
            this.logSuccessfulEmission(command.data);
        } catch (error) {
            this.logger.error(
                `Failed to process realtime events for ${command.data.length} trackers`, 
                error.stack
            );
        }
    }

    private async emitRealtimeEvents(events: TrackerRealtimeEventCommandModel[]): Promise<void> {
        await Promise.all(
            events.map(event => this.emitSingleEvent(event))
        );
    }

    private async emitSingleEvent(event: TrackerRealtimeEventCommandModel): Promise<void> {
        try {
            await this.socketGateway.emitToAll(
                SOCKET_IO_CONSTANTS.EVENTS.TRACKER_EVENT.TRACKER_REALTIME_EVENT,
                event
            );

            this.logger.log('send realtime socket');
        } catch (error) {
            this.logger.error(
                `Failed to emit event for tracker ${event.trackerId}`,
                error.stack
            );
            throw error;
        }
    }

    private logSuccessfulEmission(events: TrackerRealtimeEventCommandModel[]): void {
        const trackerIds = events.map(e => e.trackerId).join(', ');
        this.logger.log(
            `Successfully emitted realtime events for trackers: ${trackerIds}`
        );
    }
}