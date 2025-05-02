import { Module } from '@nestjs/common';
import {
  ApplicationScheduler,
} from './infrastructure';


import { AppConfigService } from 'src/config';

import { CommonModule } from 'src/common/common.module';
@Module({
  imports: [
    CommonModule,
    
  ],
  controllers: [
    
  ],
  providers: [
   
   
    ApplicationScheduler
  ],
})
export class TrackingModule { }
