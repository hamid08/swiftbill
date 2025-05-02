import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppConfigModule } from './config';
import { LoggingMiddleware } from './common';
import { CqrsModule } from '@nestjs/cqrs';
import { TrackingModule } from './tracking/tracking.module';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    AppConfigModule,
    TerminusModule,
    CqrsModule.forRoot(),
    ScheduleModule.forRoot(),
    CommonModule,
    TrackingModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
