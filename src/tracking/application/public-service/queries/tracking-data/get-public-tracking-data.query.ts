import { AppException } from "src/common";

export class GetPublicTrackingDataQuery {
    constructor(
        public readonly fromDate: Date,
        public readonly toDate: Date,
        public readonly identifier: string,
        public readonly type: 'device' | 'vehicle',
        public readonly page: number = 1,
        public readonly limit: number = 1000,
    ) {
        // Validate type
        if (type !== 'device' && type !== 'vehicle') {
            throw new Error('Invalid type. Must be "device" or "vehicle"');
        }

        // Ensure valid numbers
        this.page = isNaN(page) || page < 1 ? 1 : page;
        this.limit = isNaN(limit) || limit < 1 ? 1000 : limit;

        if (this.limit > 1000) {
            throw AppException.BadRequest('حداکثر تعداد رکورد قابل دریافت در هر درخواست 1000 عدد می‌باشد');
        }
    }
}