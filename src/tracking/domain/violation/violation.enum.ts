export enum ViolationType {
    ExitingAuthorizedArea = 1, // خروج از منطقه مجاز
    OverstayingInParkingArea = 2, // توقف بیش از حد در محل توقفگاه
    UnauthorizedStopInAuthorizedArea = 3, // توقف غیرمجاز در منطقه مجاز
    UnauthorizedStopOutOfBounds = 4, // توقف غیرمجاز در خارج از محدوده
    OverstayingInSpecialRestrictedArea = 5, // توقف بیش از حد در منطقه محدود ویژه
}


