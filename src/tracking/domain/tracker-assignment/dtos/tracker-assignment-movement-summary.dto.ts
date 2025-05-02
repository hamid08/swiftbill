export class TrackerAssignmentMovementSummaryDto {
    speed: MovementParameterStatistics;
    fuel_rate: MovementParameterStatistics; // impliment soon
    engine_rpm: MovementParameterStatistics;// impliment soon
}

export class MovementParameterStatistics {
    minValue: number;
    avgValue: number;
    currentValue: number;
    maxValue: number;
}
