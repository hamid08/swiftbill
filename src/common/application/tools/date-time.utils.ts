import moment from 'moment-timezone';
import { AppException } from '../exceptions';
type DateInput = Date | string | null | undefined;

export class DateTimeUtils {
  static toStandardDate(timestamp: number): Date {
    moment.tz.setDefault(moment.tz.guess());
    const formattedDateTime = moment(timestamp * 1000).format(
      'YYYY-MM-DDTHH:mm:ss',
    );
    return new Date(`${formattedDateTime}Z`);
  }

  static getUtcDateLocalTime() {
    moment.tz.setDefault(moment.tz.guess());
    var datetimeLocalFormat = moment().format("YYYY-MM-DDTHH:mm:ss");
    var datetime = new Date(`${datetimeLocalFormat}Z`);
    return datetime;
  }

  static getUtcDateLocalTimeByTimeStamp(timestamp: number) {
    moment.tz.setDefault(moment.tz.guess());
    var datetimeLocalFormat = moment(timestamp * 1000).format("YYYY-MM-DDTHH:mm:ss");
    var datetime = new Date(`${datetimeLocalFormat}Z`);
    return datetime;
  }

  static formatDate(): string {
    const date = new Date();

    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are zero-indexed
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  static momentFormattedDate(): string {
    return moment()
      .milliseconds(0) // Set milliseconds to 0
      .format("YYYY-MM-DDTHH:mm:ss.SSS[+00:00]");
  }

  static validateDateRange(
    fromDate: Date,
    toDate: Date,
    maxAllowedDays: number,
    errorMessage: string
  ): void {
    const timeDiffInDays = Math.ceil(
      Math.abs(toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (timeDiffInDays > maxAllowedDays) {
      throw AppException.BadRequest(errorMessage);
    }
  }




  /**
 * Converts a UTC Date to local time (using system timezone)
 */
  static toLocal(utcDate: DateInput): Date | null {
    try {
      const date = this.normalizeDateInput(utcDate);
      if (!date) return null;

      return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      );
    } catch (error) {
      console.error('Error converting UTC to local:', error);
      return null;
    }
  }

  /**
 * Converts a local Date to UTC
 */
  static toUtc(localDate: DateInput): Date | null {
    try {
      const date = this.normalizeDateInput(localDate);
      if (!date) return null;

      return new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds()
        )
      );
    } catch (error) {
      console.error('Error converting local to UTC:', error);
      return null;
    }
  }

  /**
   * Normalizes date input to Date object or null
   */
  static normalizeDateInput(value: DateInput): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      if (!value.trim()) return null;
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }


  /**
 * Generates a date range with configurable default days
 * @param options Optional parameters
 * @returns { fromDate: Date, toDate: Date } with time boundaries
 */
  static getDateRange(options?: {
    fromDate?: Date;
    toDate?: Date;
    defaultDays?: number; // Default: 7 days
  }): { effectiveFromDate: Date; effectiveToDate: Date } {
    const { fromDate, toDate, defaultDays = 7 } = options || {};

    // Get current date (local time)
    const today = new Date();

    // Set time boundaries
    const setStartOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const setEndOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(23, 59, 59, 999);
      return d;
    };

    // --- Calculate effective dates ---
    let effectiveFromDate: Date;
    let effectiveToDate: Date;

    if (fromDate && toDate) {
      // Case 1: Both dates provided
      effectiveFromDate = setStartOfDay(fromDate);
      effectiveToDate = setEndOfDay(toDate);
    } else if (fromDate) {
      // Case 2: Only fromDate provided
      effectiveFromDate = setStartOfDay(fromDate);
      effectiveToDate = setEndOfDay(today);
    } else if (toDate) {
      // Case 3: Only toDate provided
      effectiveToDate = setEndOfDay(toDate);
      effectiveFromDate = new Date(toDate);
      effectiveFromDate.setDate(effectiveFromDate.getDate() - defaultDays);
      effectiveFromDate = setStartOfDay(effectiveFromDate);
    } else {
      // Case 4: No dates provided (use default range)
      effectiveToDate = setEndOfDay(today);
      effectiveFromDate = new Date(today);
      effectiveFromDate.setDate(effectiveFromDate.getDate() - defaultDays);
      effectiveFromDate = setStartOfDay(effectiveFromDate);
    }

    return { effectiveFromDate, effectiveToDate };
  }
}
