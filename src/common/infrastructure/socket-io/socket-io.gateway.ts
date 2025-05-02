import { Logger, OnModuleDestroy, OnModuleInit, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SOCKET_IO_CONSTANTS, SocketAuthService, WsJwtGuard } from 'src/common/application';
import { AppConfigService } from 'src/config';

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS_API?.split(',').map(o => o.trim()) || [],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})
export class SocketIoGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(SocketIoGateway.name);
  private authenticatedPartners = new Map<string, { socketId: string, partnerId: string }>();
  private eventHandlers: Map<
    string,
    (payload: any, socket: Socket, callback: (response: any) => void) => Promise<void>
  > = new Map();

  constructor(private readonly socketAuthService: SocketAuthService) { }

  onModuleInit() {
    this.logger.log('Socket.IO Gateway initialized');
  }

  //#region Connection Management
  async handleConnection(socket: Socket) {
    try {

      if (!this.socketAuthService.authenticateSocket(socket)) {
        throw new Error('Authentication failed');
      }

      this.logger.log(SOCKET_IO_CONSTANTS.MESSAGES.CONNECT_SUCCESS(socket.id));

      // Notify client of successful connection
      socket.emit(SOCKET_IO_CONSTANTS.EVENTS.CONNECTION_EVENT.ESTABLISHED);

      // Setup generic event handler
      socket.onAny(async (event, payload, callback) => {
        const handler = this.eventHandlers.get(event);
        if (handler) {
          try {
            await handler(payload, socket, callback);
          } catch (error) {
            this.logger.error(`Error handling event ${event}: ${error.message}`);
          }
        }
      });

      // Handle authentication for partners
      if (socket.handshake.query.partnerId) {
        await this.handlePartnerConnection(socket);
      }

    } catch (error) {
      this.logger.error(`Connection error for ${socket.id}: ${error.message}`);
      socket.emit(SOCKET_IO_CONSTANTS.EVENTS.CONNECTION_EVENT.ERROR, {
        error: SOCKET_IO_CONSTANTS.ERROR_CODES.AUTH_TIMEOUT
      });
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    if (socket.data.partnerId) {
      this.authenticatedPartners.delete(socket.data.partnerId);
      this.logger.log(SOCKET_IO_CONSTANTS.MESSAGES.DISCONNECT(socket.id));
    }
  }
  //#endregion

  //#region Partner Specific Handlers
  @SubscribeMessage(SOCKET_IO_CONSTANTS.EVENTS.PARTNER_ROOM_EVENT.JOIN_REQUEST)
  async handlePartnerJoinRequest(
    @MessageBody() partnerId: string,
    @ConnectedSocket() socket: Socket
  ) {
    try {
      socket.join(`partner_${partnerId}`);
      this.authenticatedPartners.set(partnerId, { socketId: socket.id, partnerId });

      socket.emit(SOCKET_IO_CONSTANTS.EVENTS.PARTNER_ROOM_EVENT.JOIN_SUCCESS, {
        partnerId,
        message: SOCKET_IO_CONSTANTS.MESSAGES.PARTNER_CONNECTED(partnerId)
      });

      this.logger.log(SOCKET_IO_CONSTANTS.MESSAGES.PARTNER_CONNECTED(partnerId));

    } catch (error) {
      socket.emit(SOCKET_IO_CONSTANTS.EVENTS.PARTNER_ROOM_EVENT.JOIN_REJECTED, {
        error: error.message,
        code: SOCKET_IO_CONSTANTS.ERROR_CODES.PERMISSION_DENIED
      });
      this.logger.error(SOCKET_IO_CONSTANTS.MESSAGES.PARTNER_AUTH_FAILED(partnerId));
    }
  }

  @SubscribeMessage(SOCKET_IO_CONSTANTS.EVENTS.PARTNER_EVENT.REALTIME_DATA)
  async handlePartnerRealtimeData(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket
  ) {
    const partnerId = socket.data.partnerId;
    if (!partnerId) {
      return socket.emit(SOCKET_IO_CONSTANTS.EVENTS.CONNECTION_EVENT.ERROR, {
        error: SOCKET_IO_CONSTANTS.ERROR_CODES.PERMISSION_DENIED
      });
    }

    // Process and broadcast partner data
    this.broadcastToPartnerRoom(partnerId, data);
    this.logger.log(SOCKET_IO_CONSTANTS.MESSAGES.PARTNER_DATA_SENT(partnerId));
  }
  //#endregion

  //#region Room Management
  @SubscribeMessage(SOCKET_IO_CONSTANTS.EVENTS.ROOM_EVENT.JOIN_REQUEST)
  handleJoinRoomRequest(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket
  ) {

    this.confirmRoomJoin(socket, roomId.toString());

  }
  //#endregion

  //#region Utility Methods
  private async handlePartnerConnection(socket: Socket) {
    const partnerId = socket.handshake.query.partnerId as string;
    const partnerToken = socket.handshake.auth.token;

    socket.data.partnerId = partnerId;
    this.authenticatedPartners.set(partnerId, { socketId: socket.id, partnerId });

    socket.emit(SOCKET_IO_CONSTANTS.EVENTS.CONNECTION_EVENT.AUTHENTICATED, {
      partnerId,
      message: SOCKET_IO_CONSTANTS.MESSAGES.AUTH_SUCCESS(partnerId)
    });
  }

  private broadcastToPartnerRoom(partnerId: string, data: any) {
    this.server.to(`partner_${partnerId}`).emit(
      SOCKET_IO_CONSTANTS.EVENTS.PARTNER_EVENT.REALTIME_DATA,
      data
    );
  }

  private denyRoomJoin(socket: Socket, roomId: string) {
    socket.emit(SOCKET_IO_CONSTANTS.EVENTS.ROOM_EVENT.JOIN_REJECTED, {
      error: SOCKET_IO_CONSTANTS.MESSAGES.ROOM_JOIN_REJECTED(roomId, 'Room is full'),
      code: SOCKET_IO_CONSTANTS.ERROR_CODES.ROOM_FULL
    });
  }

  private confirmRoomJoin(socket: Socket, roomId: string) {
    socket.join(roomId);
    socket.emit(SOCKET_IO_CONSTANTS.EVENTS.ROOM_EVENT.JOIN_SUCCESS, {
      message: SOCKET_IO_CONSTANTS.MESSAGES.ROOM_JOIN_SUCCESS(roomId, socket.id)
    });
  }

  /**
   * Register a new event handler dynamically.
   * @param event The event name.
   * @param handler The handler function to execute for this event.
   */
  registerHandler(
    event: string,
    handler: (payload: any, socket: Socket, ackCallback: (response: any) => void) => Promise<void>
  ) {
    if (this.eventHandlers.has(event)) {
      this.logger.warn(`Handler for event "${event}" is already registered.`);
    }
    this.eventHandlers.set(event, handler);
    this.logger.log(`Handler registered for event: ${event}`);
  }

  //#endregion

  //#region Public API



  emitToPartner(partnerId: string, event: string, data: any) {
    this.server.to(`partner_${partnerId}`).emit(event, data);
  }

  emitToTarget(targetId: string, event: string, data: any) {
    this.server.to(targetId).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  getConnectedPartners(): string[] {
    return Array.from(this.authenticatedPartners.keys());
  }
  //#endregion

  async onModuleDestroy() {
    try {
      this.logger.log('Starting graceful shutdown of Socket.IO Gateway...');

      // 1. Disconnect all connected clients gracefully
      if (this.server) {
        this.server.sockets?.sockets?.forEach((socket: Socket) => {
          // socket.emit(SOCKET_IO_CONSTANTS.EVENTS.CONNECTION_EVENT.SHUTDOWN, {
          //   message: 'Server is shutting down',
          //   code: SOCKET_IO_CONSTANTS.ERROR_CODES.SERVER_SHUTDOWN
          // });
          socket.disconnect(true); // Force immediate disconnect
        });

        // 2. Close the server
        this.server.close(() => {
          this.logger.log('Socket.IO server closed successfully');
        });
      }

      // 3. Clear all internal data structures
      this.authenticatedPartners.clear();
      this.eventHandlers.clear();

      this.logger.log('Socket.IO Gateway destroyed successfully');
    } catch (error) {
      this.logger.error(`Error during shutdown: ${error.message}`);
    }
  }
}