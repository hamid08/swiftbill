import { Entity } from "src/common";
import { ViolationType } from "./violation.enum";

export class Violation extends Entity {
    private type: ViolationType;
    private trackerAssignmentId: number;
    private registerDate: Date;
    private startDate: Date;
    private endDate?: Date;


    private constructor() {
        super();
    }

    //#region Primary Operations

    public static startViolation(type: ViolationType, trackerAssignmentId: number, startDate: Date): Violation {
        const violation = new Violation();
        violation.setTrackerAssignmentId(trackerAssignmentId);
        violation.setType(type);
        violation.setRegisterDate(new Date());
        violation.setStartDate(startDate);

        return violation;
    }

    public static endViolation(type: ViolationType, trackerAssignmentId: number, endDate: Date): Violation {
        const violation = new Violation();
        violation.setTrackerAssignmentId(trackerAssignmentId);
        violation.setType(type);
        violation.setEndDate(endDate);
        return violation;
    }

    public static mapToDomain(id: number, type: ViolationType, trackerAssignmentId: number, registerDate: Date, startDate: Date, endDate?: Date): Violation {
        const violation = new Violation();
        violation.setId(id);
        violation.setTrackerAssignmentId(trackerAssignmentId);
        violation.setType(type);
        violation.setRegisterDate(registerDate);
        violation.setStartDate(startDate);
        violation.setEndDate(endDate);
        return violation;
    }

    //#endregion

    //#region Setters

    public setTrackerAssignmentId(value: number): void {
        this.trackerAssignmentId = value;
    }

    public setType(value: ViolationType): void {
        this.type = value;
    }

    public setRegisterDate(value: Date): void {
        this.registerDate = value;
    }

    public setStartDate(value: Date): void {
        this.startDate = value;
    }

    public setEndDate(value: Date): void {
        this.endDate = value;
    }

    //#endregion

    //#region Getters

    public getTrackerAssignmentId(): number {
        return this.trackerAssignmentId;
    }

    public getType(): ViolationType {
        return this.type;
    }

    public getRegisterDate(): Date {
        return this.registerDate;
    }

    public getStartDate(): Date {
        return this.startDate;
    }

    public getEndDate(): Date | undefined {
        return this.endDate;
    }

    //#endregion
}
