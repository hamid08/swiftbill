import { IOperationResult } from "../results";

export class ResultUtils {
    /**
     * Attempts to cast the provided data to an OperationResult<T>.
     * Returns null if the cast is invalid.
     *
     * @param data The data to cast.
     * @returns The cast OperationResult<T> or null.
     */
    static getOperationResult<T>(data: any): IOperationResult<T> | null {
        try {
            if (
                typeof data === "object" &&
                data !== null &&
                typeof data.success === "boolean" &&
                "data" in data &&
                Array.isArray(data.messages)
            ) {
                return data as IOperationResult<T>;
            }
            return null; // Return null if the cast is invalid
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}
