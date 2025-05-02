export class TrackingDeviceError {
    // Not Found Errors
    static readonly TRACKING_DEVICE_NOT_FOUND = 'دستگاه ردیابی یافت نشد';
    static readonly DEVICE_MODEL_NOT_FOUND = 'مدل دستگاه یافت نشد';
    
    // Duplicate Data Errors
    static readonly IMEI_ALREADY_ASSIGNED = 'این IMEI در حال استفاده است';
    static readonly DUPLICATE_SERIAL_NUMBER = 'شماره سریال دستگاه تکراری است';
    static readonly DUPLICATE_SIM_NUMBER = 'شماره سیم‌کارت تکراری است';
    
    // Validation Errors
    static readonly INVALID_IMEI_FORMAT = 'فرمت IMEI وارد شده نامعتبر است';
    static readonly INVALID_SIM_FORMAT = 'فرمت شماره سیمکارت نامعتبر است';
    
    
    // Business Rule Errors
    static readonly DEVICE_IN_USE = 'دستگاه در حال استفاده است و نمی‌ توان آن را حذف کرد';
    static readonly DEVICE_HAS_ACTIVE_ASSIGNMENT = 'دستگاه دارای انتساب فعال است';
    
    // Dynamic Errors
    static DeviceModelMismatch(imei: string) {
        return `دستگاه با IMEI ${imei} وجود دارد ولی مدل آن موبایل نیست`;
    }
    
    static DeviceAssignmentConflict(imei: string) {
        return `دستگاه با IMEI ${imei} در حال حاضر به دستگاه دیگری متصل است`;
    }
    
    static InvalidStatusTransition(currentStatus: string, newStatus: string) {
        return `تغییر وضعیت از ${currentStatus} به ${newStatus} مجاز نیست`;
    }
}