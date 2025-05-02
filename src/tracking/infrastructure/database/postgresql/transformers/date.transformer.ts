import { DateTimeUtils } from 'src/common';
import { ValueTransformer } from 'typeorm';

type DateInput = Date | string | null | undefined;

/**
 * Safely transforms local dates to UTC when writing to database
 */
export const appDateTransformer: ValueTransformer = {
    //Writting to database
    to: (value: DateInput) => value,

    //Reading from database
    from: (value: DateInput) => {
        return DateTimeUtils.toUtc(value);
    }
};