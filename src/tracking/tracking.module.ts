import { Module } from '@nestjs/common';
import {
  ApplicationScheduler,
} from './infrastructure';


import { GridUtilsService, HTTP_CONSTANT, HttpModule } from 'src/common';
import { AppConfigService } from 'src/config';

import { CommonModule } from 'src/common/common.module';
@Module({
  imports: [
    CommonModule,
    HttpModule.forFeature([
      {
        serviceName: HTTP_CONSTANT.SERVICES.TRANSPORT.SERVICE_NAME,
        config: (appConfigService: AppConfigService) => ({
          baseURL: appConfigService.sync.singleEndpoint.url,
          enableLogging: true,
          rejectUnauthorized:false
        }),
      },
      {
        serviceName: HTTP_CONSTANT.SERVICES.CORE.SERVICE_NAME,
        config: (appConfigService: AppConfigService) => ({
          baseURL: appConfigService.sync.multipleEndpoints.coreUrl,
          enableLogging: true,
          rejectUnauthorized:false
        }),
      },
      {
        serviceName: HTTP_CONSTANT.SERVICES.FLEET.SERVICE_NAME,
        config: (appConfigService: AppConfigService) => ({
          baseURL: appConfigService.sync.multipleEndpoints.fleetUrl,
          enableLogging: true,
          rejectUnauthorized:false
        }),
      },
      {
        serviceName: HTTP_CONSTANT.SERVICES.AUTH.SERVICE_NAME,
        config: (appConfigService: AppConfigService) => ({
          baseURL: appConfigService.auth.authority,
          enableLogging: true,
          rejectUnauthorized:false
        }),
      },
      {
        serviceName: HTTP_CONSTANT.SERVICES.TRACKING_AGENT.SERVICE_NAME,
        config: (appConfigService: AppConfigService) => ({
          baseURL: appConfigService.trackingAgent.url,
          rejectUnauthorized:false
        }),
      },
      {
        serviceName: HTTP_CONSTANT.SERVICES.NESHAN.SERVICE_NAME,
        config: (appConfigService: AppConfigService) => ({
          baseURL: appConfigService.neshanApi.url,
        }),
      },
      {
        serviceName: HTTP_CONSTANT.SERVICES.OPEN_WEATHER.SERVICE_NAME,
        config: (appConfigService: AppConfigService) => ({
          baseURL: appConfigService.openWeatherApi.url,
          defaultTimeout: 5000, // 5 seconds for OpenWeather
        }),
      },
    ]),
  ],
  controllers: [
    
  ],
  providers: [GridUtilsService,
   
   
    ApplicationScheduler
  ],
})
export class TrackingModule { }
