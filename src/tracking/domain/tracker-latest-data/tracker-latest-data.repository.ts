import { MinimalLocationB1 } from "../common";
import { TrackerLatestData } from "./tracker-latest-data.entity";

export const TrackerLatestDataRepository = Symbol(
    'TrackerLatestDataRepository',
).valueOf();
export interface TrackerLatestDataRepository {

    updateTrackerLatestData(trackerLatestData: TrackerLatestData): Promise<void>;
    updateTrackerLatestDataWithTerminalNumber(terminalNumber: string, trackerLatestData: TrackerLatestData): Promise<void>;
    getPointDetails(trackerAssignmentId: number, latitude: number, longitude: number): Promise<MinimalLocationB1 | null>;
}
