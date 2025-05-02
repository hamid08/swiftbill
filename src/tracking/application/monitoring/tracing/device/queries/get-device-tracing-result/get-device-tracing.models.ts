export enum TrackingEnvironmentTypeResponse {
    Cloud = 1, // سیستم ابری
    Local = 2, // سیستم محلی    
}

export enum TrackingServiceTypeResponse {
    DataReception = 1, // دریافت داده
    DataProcessing = 2, // پردازش
    DataDistribution = 3, // توزیع
    LocalDataReception = 4, // دریافت داده محلی 
    DataStorageAndFinalProcessing = 5, // ذخیره داده و پردازش نهایی
}

export interface DeviceTracingServiceResponse {
    systemType: TrackingServiceTypeResponse;
    serviceType: TrackingEnvironmentTypeResponse;
    visitDateTime?: Date; // زمان مشاهده
    isTraceSuccessful: boolean;
}


export class DeviceTracingResponse {
    isTracing: boolean;// true= در حال دریافت داده های ردگیری  & false = در انتظار آغاز فرآیند ردگیری
    lastTrackingTime?: Date;
    trackerLastConnectionTime?: Date;
    services?: DeviceTracingServiceResponse[];
}
