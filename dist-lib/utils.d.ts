/**
 * Waits for timeout
 * @param timeout time to wait in ms
 */
export declare function sleep(timeout?: number): Promise<void>;
/**
 * Deletes first entry of value in target
 * @param target from where to delete
 * @param value what to delete
 * @returns true if anything has been delete, false otherwise
 */
export declare function findAndDelete(target: {
    [ket: string]: any;
    [Symbol.iterator]: any;
} | any[], value: any): boolean;
/**
 * Deletes all entries of value in target
 * @param target from what
 * @param value what to  delete
 * @returns true if anything has been delete, false otherwise
 */
export declare function findAndDeleteAll(target: {
    [ket: string]: any;
    [Symbol.iterator]: any;
} | any[], value: any): boolean;
