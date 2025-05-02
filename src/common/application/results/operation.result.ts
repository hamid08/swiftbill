export interface IOperationResult<T> {
  success: boolean;
  data: T;
  messages: string[];
}

/**
 * Returns a successful operation result.
 * @param message Optional success message.
 * @param data Optional data to include in the result.
 * @returns An IOperationResult with success set to true.
 */
export function successResult<T>(
  message?: string,
  data?: T,
): IOperationResult<T> {
  return {
    success: true,
    data: data || ({} as T),
    messages: [message || 'Operation completed successfully'],
  };
}

/**
 * Returns a failed operation result.
 * @param message Optional error message.
 * @param data Optional data to include in the result.
 * @returns An IOperationResult with success set to false.
 */
export function failedResult<T>(
  message?: string,
  data?: T,
): IOperationResult<T> {
  return {
    success: false,
    data: data || ({} as T),
    messages: [message || 'Operation failed'],
  };
}