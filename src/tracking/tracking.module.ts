import { Module } from '@nestjs/common';
import {
  ApplicationScheduler,
} from './infrastructure';


import { GridUtilsService } from 'src/common';
import { AppConfigService } from 'src/config';

import { CommonModule } from 'src/common/common.module';
@Module({
  imports: [
    CommonModule,
    
  ],
  controllers: [
    
  ],
  providers: [GridUtilsService,
   
   
    ApplicationScheduler
  ],
})
export class TrackingModule { }
