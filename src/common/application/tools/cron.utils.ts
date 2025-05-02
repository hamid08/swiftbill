export class CronUtils {
  static getCronExpression(value: number, unit: TimeUnit): string {
    if (value < 1) {
      throw new Error('Value must be greater than 0');
    }

    switch (unit) {
      case TimeUnit.SECONDS:
        return value > 59 ? '* * * * * *' : `*/${value} * * * * *`; // Every X seconds
      case TimeUnit.MINUTES:
        return value > 59 ? '* * * * *' : `*/${value} * * * *`; // Every X minutes
      case TimeUnit.HOURS:
        return value > 23 ? '* * * *' : `0 */${value} * * *`; // Every X hours, on the hour
      case TimeUnit.DAYS:
        return value > 31 ? '* * *' : `0 0 */${value} * *`; // Every X days, at midnight
      case TimeUnit.MONTHS:
        return value > 12 ? '*' : `0 0 1 */${value} *`; // Every X months, on the 1st at midnight
      case TimeUnit.YEARS:
        return `0 0 1 1 */${value}`; // Every X years, on Jan 1st at midnight
      default:
        throw new Error('Invalid time unit');
    }
  }
}

export enum TimeUnit {
  SECONDS = 'seconds',
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  MONTHS = 'months',
  YEARS = 'years',
}

export enum AppCronExpression {
  EVERY_SECOND = '* * * * * *', // Every second
  EVERY_5_SECONDS = '*/5 * * * * *', // Every 5 seconds
  EVERY_10_SECONDS = '*/10 * * * * *', // Every 10 seconds
  EVERY_30_SECONDS = '*/30 * * * * *', // Every 30 seconds
  EVERY_MINUTE = '* * * * *', // Every minute
  EVERY_5_MINUTES = '*/5 * * * *', // Every 5 minutes
  EVERY_10_MINUTES = '*/10 * * * *', // Every 10 minutes
  EVERY_30_MINUTES = '*/30 * * * *', // Every 30 minutes
  EVERY_HOUR = '0 * * * *', // Every hour
  EVERY_2_HOURS = '0 */2 * * *', // Every 2 hours
  EVERY_3_HOURS = '0 */3 * * *', // Every 3 hours
  EVERY_4_HOURS = '0 */4 * * *', // Every 4 hours
  EVERY_5_HOURS = '0 */5 * * *', // Every 5 hours
  EVERY_6_HOURS = '0 */6 * * *', // Every 6 hours
  EVERY_7_HOURS = '0 */7 * * *', // Every 7 hours
  EVERY_8_HOURS = '0 */8 * * *', // Every 8 hours
  EVERY_9_HOURS = '0 */9 * * *', // Every 9 hours
  EVERY_10_HOURS = '0 */10 * * *', // Every 10 hours
  EVERY_11_HOURS = '0 */11 * * *', // Every 11 hours
  EVERY_12_HOURS = '0 */12 * * *', // Every 12 hours
  EVERY_DAY_AT_NOON = '0 12 * * *', // Every day at noon
  EVERY_DAY_AT_MIDNIGHT = '0 0 * * *', // Every day at midnight
  EVERY_DAY_AT_1AM = '0 1 * * *', // Every day at 1 AM
  EVERY_DAY_AT_2AM = '0 2 * * *', // Every day at 2 AM
  EVERY_DAY_AT_3AM = '0 3 * * *', // Every day at 3 AM
  EVERY_DAY_AT_4AM = '0 4 * * *', // Every day at 4 AM
  EVERY_DAY_AT_5AM = '0 5 * * *', // Every day at 5 AM
  EVERY_DAY_AT_6AM = '0 6 * * *', // Every day at 6 AM
  EVERY_DAY_AT_7AM = '0 7 * * *', // Every day at 7 AM
  EVERY_DAY_AT_8AM = '0 8 * * *', // Every day at 8 AM
  EVERY_DAY_AT_9AM = '0 9 * * *', // Every day at 9 AM
  EVERY_DAY_AT_10AM = '0 10 * * *', // Every day at 10 AM
  EVERY_DAY_AT_11AM = '0 11 * * *', // Every day at 11 AM
  EVERY_DAY_AT_1PM = '0 13 * * *', // Every day at 1 PM
  EVERY_DAY_AT_2PM = '0 14 * * *', // Every day at 2 PM
  EVERY_DAY_AT_3PM = '0 15 * * *', // Every day at 3 PM
  EVERY_DAY_AT_4PM = '0 16 * * *', // Every day at 4 PM
  EVERY_DAY_AT_5PM = '0 17 * * *', // Every day at 5 PM
  EVERY_DAY_AT_6PM = '0 18 * * *', // Every day at 6 PM
  EVERY_DAY_AT_7PM = '0 19 * * *', // Every day at 7 PM
  EVERY_DAY_AT_8PM = '0 20 * * *', // Every day at 8 PM
  EVERY_DAY_AT_9PM = '0 21 * * *', // Every day at 9 PM
  EVERY_DAY_AT_10PM = '0 22 * * *', // Every day at 10 PM
  EVERY_DAY_AT_11PM = '0 23 * * *', // Every day at 11 PM
  EVERY_WEEK = '0 0 * * 0', // Every week (Sunday)
  EVERY_WEEKDAY = '0 0 * * 1-5', // Every weekday (Monday to Friday)
  EVERY_WEEKEND = '0 0 * * 0,6', // Every weekend (Saturday and Sunday)
  EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT = '0 0 1 * *', // Every 1st day of the month at midnight
  EVERY_2ND_HOUR = '0 */2 * * *', // Every 2nd hour
  EVERY_2ND_HOUR_FROM_1AM_THROUGH_11PM = '0 1-23/2 * * *', // Every 2nd hour from 1 AM through 11 PM
  EVERY_2ND_MONTH = '0 0 1 */2 *', // Every 2nd month
  EVERY_QUARTER = '0 0 1 */3 *', // Every quarter (January, April, July, October)
  EVERY_6_MONTHS = '0 0 1 */6 *', // Every 6 months
  EVERY_YEAR = '0 0 1 1 *', // Every year (January 1st)
  EVERY_30_MINUTES_BETWEEN_9AM_AND_5PM = '0 */30 9-17 * * 1-5', // Every 30 minutes between 9 AM and 5 PM, Monday to Friday
  EVERY_30_MINUTES_BETWEEN_9AM_AND_6PM = '0 */30 9-18 * * 1-5', // Every 30 minutes between 9 AM and 6 PM, Monday to Friday
  EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM = '0 */30 10-19 * * 1-5', // Every 30 minutes between 10 AM and 7 PM, Monday to Friday
  MONDAY_TO_FRIDAY_AT_1AM = '0 1 * * 1-5', // Monday to Friday at 1 AM
  MONDAY_TO_FRIDAY_AT_2AM = '0 2 * * 1-5', // Monday to Friday at 2 AM
  MONDAY_TO_FRIDAY_AT_3AM = '0 3 * * 1-5', // Monday to Friday at 3 AM
  MONDAY_TO_FRIDAY_AT_4AM = '0 4 * * 1-5', // Monday to Friday at 4 AM
  MONDAY_TO_FRIDAY_AT_5AM = '0 5 * * 1-5', // Monday to Friday at 5 AM
  MONDAY_TO_FRIDAY_AT_6AM = '0 6 * * 1-5', // Monday to Friday at 6 AM
  MONDAY_TO_FRIDAY_AT_7AM = '0 7 * * 1-5', // Monday to Friday at 7 AM
  MONDAY_TO_FRIDAY_AT_8AM = '0 8 * * 1-5', // Monday to Friday at 8 AM
  MONDAY_TO_FRIDAY_AT_9AM = '0 9 * * 1-5', // Monday to Friday at 9 AM
  MONDAY_TO_FRIDAY_AT_09_30AM = '30 9 * * 1-5', // Monday to Friday at 9:30 AM
  MONDAY_TO_FRIDAY_AT_10AM = '0 10 * * 1-5', // Monday to Friday at 10 AM
  MONDAY_TO_FRIDAY_AT_11AM = '0 11 * * 1-5', // Monday to Friday at 11 AM
  MONDAY_TO_FRIDAY_AT_11_30AM = '30 11 * * 1-5', // Monday to Friday at 11:30 AM
  MONDAY_TO_FRIDAY_AT_12PM = '0 12 * * 1-5', // Monday to Friday at 12 PM
  MONDAY_TO_FRIDAY_AT_1PM = '0 13 * * 1-5', // Monday to Friday at 1 PM
  MONDAY_TO_FRIDAY_AT_2PM = '0 14 * * 1-5', // Monday to Friday at 2 PM
  MONDAY_TO_FRIDAY_AT_3PM = '0 15 * * 1-5', // Monday to Friday at 3 PM
  MONDAY_TO_FRIDAY_AT_4PM = '0 16 * * 1-5', // Monday to Friday at 4 PM
  MONDAY_TO_FRIDAY_AT_5PM = '0 17 * * 1-5', // Monday to Friday at 5 PM
  MONDAY_TO_FRIDAY_AT_6PM = '0 18 * * 1-5', // Monday to Friday at 6 PM
  MONDAY_TO_FRIDAY_AT_7PM = '0 19 * * 1-5', // Monday to Friday at 7 PM
  MONDAY_TO_FRIDAY_AT_8PM = '0 20 * * 1-5', // Monday to Friday at 8 PM
  MONDAY_TO_FRIDAY_AT_9PM = '0 21 * * 1-5', // Monday to Friday at 9 PM
  MONDAY_TO_FRIDAY_AT_10PM = '0 22 * * 1-5', // Monday to Friday at 10 PM
  MONDAY_TO_FRIDAY_AT_11PM = '0 23 * * 1-5', // Monday to Friday at 11 PM
}
