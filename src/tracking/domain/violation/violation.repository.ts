import { BaseGridViewDto, GridViewDto } from "src/common";
import { Violation } from "./violation.entity";
import { ViolationType } from "./violation.enum";
import { ViolationGridResponseDto } from "./dtos";

export const ViolationRepository = Symbol(
    'ViolationRepository',
).valueOf();
export interface ViolationRepository {

    createViolation(violation: Violation): Promise<number | null>;
    hasViolationStarted(trackerAssignmentId: number, violationType: ViolationType): Promise<boolean>;
    getCurrentViolation(trackerAssignmentId: number, violationType: ViolationType): Promise<Violation | null>;
    completeViolation(violationId: number, endDate: Date): Promise<void>;
    grid(filter: BaseGridViewDto, trackerAssignmentId: number, fromDate: Date | undefined, toDate: Date | undefined): Promise<GridViewDto<ViolationGridResponseDto>>;
    getByViolationId(violationId: number): Promise<Violation | null>;
    getViolationCountWithDateRange(trackerAssignmentId: number, fromDate: Date, toDate: Date): Promise<number>;
}
