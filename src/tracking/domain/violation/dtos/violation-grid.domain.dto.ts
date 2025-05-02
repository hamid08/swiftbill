import { Display } from 'src/common';
import { ViolationType } from 'src/tracking/domain';

export class ViolationLocationGridResponseDto {
    @Display('ارتفاع')
    altitude: number;

    @Display('طول')
    longitude: number;

    @Display('عرض')
    latitude: number;

    @Display('زاویه')
    angle: number;
}

export class ViolationGridResponseDto {
    id: number;

    @Display('نوع تخلف')
    type: ViolationType;

    @Display('تاریخ شروع تخلف')
    registerDate: Date;

    @Display('تاریخ ارسال داده')
    trafficDate: Date;

    @Display('تاریخ پایان تخلف')
    endDate?: Date;

    @Display('مکان شروع تخلف')
    startLocation: ViolationLocationGridResponseDto;

    @Display('مکان پایان تخلف')
    endLocation?: ViolationLocationGridResponseDto;
}

