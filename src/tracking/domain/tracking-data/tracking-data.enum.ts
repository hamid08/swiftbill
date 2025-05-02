export enum LocationType {

    // معتبر
    Valid = 1,        // The point (latitude, longitude) is valid

    // نا معتبر
    Invalid = 2,      // The point is invalid (e.g., out-of-bounds or malformed)

    // خطا
    Faulty = 3,       // The point has issues, but it's not entirely invalid (e.g., inaccurate or erroneous)

    // از دست رفته
    Missing = 4,      // The point data is missing start (latitude and/or longitude not provided)


    //بدون موقعیت مکانی 
    NoLocation = 5    // The point has no location data at all (e.g., not provided or unavailable)
}

export enum TrackingDataCheckStage {
    LocationValidation = 1,  // Agent service checks if location is valid
    DataIntegrityCheck = 2   // Scenario service checks for faults or missing data
}

export enum TrackingPointType {
    // نقطه شروع تخلف 
    ViolationStart = 1,

    //  نقطه پایان تخلف
    ViolationEnd = 2,

    //  نقطه معتبر
    NormalPoint = 3
}

