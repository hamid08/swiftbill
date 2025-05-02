import { Global, Module } from '@nestjs/common';
import { SocketIoGateway } from './socket-io.gateway';
import { SocketAuthService, WsAuthorizationGuard, WsJwtGuard } from 'src/common/application';

@Global()
@Module({
  providers: [
    SocketIoGateway,
    WsAuthorizationGuard,
    WsJwtGuard,
    SocketAuthService
  ],
  exports: [
    SocketIoGateway,
    WsAuthorizationGuard,
    WsJwtGuard,
    SocketAuthService
  ],
})
export class SocketIoModule { }
