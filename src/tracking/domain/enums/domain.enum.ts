export enum PlaqueStatus {
    HasPlaque = 0,
    NoPlaque = 1,
}

export enum PlaqueType {
    //شخصی
    Personal = 0,

    //قدیم
    Old = 1,

    //تاکسی
    Taxi = 2,

    //کشاورزی
    Agriculture = 3,

    //دولتی
    Governmental = 4,

    //پلیس
    Police = 5,

    //حمل و نقل عمومی
    Transportation = 6,

    //گذر موقت
    Temporary = 7,

    //موتور
    Motor = 8,

    //تاریخی
    Historical = 9,

    //تشریفات
    Formality = 10,

    //سیاسی
    Political = 11,

    //معلولین
    DisabledPeople = 12,

    //منطقه آزاد"
    FreeZone = 13,

    //تاکسی برون شهری
    SuburbanTaxi = 14,
}

export enum ActiveStatus {
    Active = 0,
    Deactive = 1,
}

export enum TrackerType {
    Vehicle = 1,
    Human = 2,
    Animal = 3,
    Equipment = 4,
    Drone = 5
}

export enum TrackerStatusFilter {
    /** روشن */
    POWERED_ON = 1,

    /** خاموش */
    POWERED_OFF = 2,

    /** آنلاین */
    ONLINE = 3,  // More natural than "CONNECTED"

    /** آفلاین */
    OFFLINE = 4, // More natural than "DISCONNECTED"

    /** در حال حرکت */
    MOVING = 5,  // More concise than "IN_MOTION"

    /** متوقف */
    STOPPED = 6, // More natural than "STATIONARY"

    /** دارای تخلف */
    HAS_VIOLATIONS = 7,

    /** همه */
    ALL = 8
}

export enum TrackerCategoryViewMode {
    /** Show currently active/operational items */
    CURRENT = 1,

    /** Show historical/archived items */
    ARCHIVE = 2,
}

export enum BatteryChargeStatus {
    CHARGING = 1,          // در حال شارژ
    DISCHARGING = 2        // در حال استفاده
}

export enum DeviceExtensionStatus {
    ACTIVE_EXTENSION = 1,  // دارای افزونه فعال
    INACTIVE_EXTENSION = 2, // دارای افزونه
    NO_EXTENSION = 3       // بدون افزونه
}

/**
 * Standard relative time periods for reporting
 */
export enum RelativeTimePeriod {
    /** Current calendar day */
    Today = 1,
    /** Last 7 calendar days */
    PastWeek = 2,
    /** Last 30 calendar days */
    PastMonth = 3,
    /** Last 90 calendar days */
    PastThreeMonths = 4,
    /** Last 180 calendar days */
    PastSixMonths = 5
}