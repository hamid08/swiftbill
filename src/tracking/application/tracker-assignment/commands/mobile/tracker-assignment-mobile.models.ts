export interface TrackerAssignmentMobileResultModel {
    failedAssignments: TrackerAssignmentMobileFailedAssignmentModel;
    successAssignments: TrackerAssignmentMobileSuccessAssignmentModel;
}

export interface TrackerAssignmentMobileFailedAssignmentModel {
    total: number;
    errors: string[];
}

export interface TrackerAssignmentMobileSuccessAssignmentModel {
    total: number;
}