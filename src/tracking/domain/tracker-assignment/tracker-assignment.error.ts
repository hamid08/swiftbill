export class TrackerAssignmentError {
    static readonly TrackerAssignmentNotFound = 'شناسه اختصاص دهی یافت نشد';
    static readonly NoVehiclesSelected = 'هیچ خودرویی انتخاب نشده است';
    static readonly FailedToGenerateUniqueTerminalNumber = 'به دلیل تکراری بودن شماره ترمینال، امکان اختصاص به خودروی دیگری وجود ندارد';
    static DeviceAlreadyAssigned(imei: string) {
        return `دستگاه با IMEI ${imei} قبلاً اختصاص داده شده است`;
    }
    static readonly TrackerAssignmentAlreadyEnded = 'این مورد قبلا پایان انتساب یافته است';
    static readonly ActiveTrackingDataPreventsDeviceChange = 'سیستم به دلیل اطلاعات ردیابی ثبت‌شده، اجازه تغییر دستگاه را نمی‌دهد';
    static InvalidImei(imei: string) {
        return `IMEI ${imei} معتبر نیست`;
    }
}

