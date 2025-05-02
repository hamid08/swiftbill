import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtPayload, SOCKET_IO_CONSTANTS, SocketIoGateway } from 'src/common';
import { GetTrackersLatestLocationQuery } from 'src/tracking/application';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TrackerLatestLocationDto } from 'src/tracking/domain';

type AuthType = 'jwt' | 'partner';

@Injectable()
export class TrackingDataClusteringSocketEvent implements OnModuleInit {
  private readonly logger = new Logger(TrackingDataClusteringSocketEvent.name);
  private static readonly EMPTY_RESPONSE: TrackerLatestLocationDto[] = [];

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly socketGateway: SocketIoGateway
  ) { }

  onModuleInit() {
    this.registerEventHandler();
  }

  private registerEventHandler(): void {
    this.socketGateway.registerHandler(
      SOCKET_IO_CONSTANTS.EVENTS.TRACKER_EVENT.ONLINE_TRACKERS_LOCATION,
      this.handleTrackingDataRequest.bind(this)
    );
  }

  private async handleTrackingDataRequest(
    payload: any,
    socket: Socket,
    callback: (response: TrackerLatestLocationDto[]) => void
  ): Promise<void> {
    try {
      if (typeof callback !== 'function') {
        socket.disconnect(); // Force disconnect if protocol isn't followed
        throw new Error('Callback function required for this event');
      }

      const result = await this.processRequestBasedOnAuthType(socket);
      callback(result);
    } catch (error) {
      this.logger.error('Failed to process tracking data request', error);
      callback(TrackingDataClusteringSocketEvent.EMPTY_RESPONSE);
    }
  }

  private async processRequestBasedOnAuthType(socket: Socket): Promise<TrackerLatestLocationDto[]> {
    const authType = this.getAuthType(socket);
    this.logger.log(`Processing tracking data request with auth type: ${authType}`);

    if (authType === 'jwt') {
      return this.handleJwtAuthRequest(socket);
    }

    return TrackingDataClusteringSocketEvent.EMPTY_RESPONSE;
  }

  private getAuthType(socket: Socket): AuthType {
    return socket.data.authType;
  }

  private async handleJwtAuthRequest(socket: Socket): Promise<TrackerLatestLocationDto[]> {
    const user = socket.data.user as JwtPayload;

    if (!user?.business_id || !user?.sub) {
      this.logger.warn('Missing business_id or sub(userId) in JWT payload');
      return TrackingDataClusteringSocketEvent.EMPTY_RESPONSE;
    }

    return this.queryBus.execute(
      new GetTrackersLatestLocationQuery(user.business_id,user.sub)
    ) || TrackingDataClusteringSocketEvent.EMPTY_RESPONSE;
  }
}