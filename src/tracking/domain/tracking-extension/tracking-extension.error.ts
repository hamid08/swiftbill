export class TrackingExtensionError {
    static readonly TRACKING_EXTENSION_ALREADY_EXISTS_IN_SAME_DEVICE = 'افزونه قبلا در این دستگاه ثبت شده است , می توانید مجدد درخواست فعالسازی ارسال نمایید';
    static readonly TRACKING_EXTENSION_STATUS_ALREADY_USED_IN_OTHER_DEVICE = 'افزونه بروی دستگاه دیگری در حال استفاده است';
    static readonly TRACKING_EXTENSION_NOT_FOUND = 'افزونه مورد نظر یافت نشد';
    static readonly TRACKING_EXTENSION_STATUS_NOT_ACTIVATING = 'برای ارسال درخواست فعال سازی بایستی افزونه در وضعیت [درحال فعالسازی] باشد';
    static readonly TRACKING_EXTENSION_STATUS_NOT_DEACTIVATING = 'برای ارسال درخواست غیر فعال سازی بایستی افزونه در یکی از وضعیت های [فعال,درحال فعالسازی,درحال غیرفعالسازی] باشد';
    static readonly TRACKING_EXTENSION_STATUS_NOT_DEACTIVE = 'برای ارسال درخواست غیرفعال سازی بایستی افزونه در وضعیت [غیرفعال] باشد';
}

