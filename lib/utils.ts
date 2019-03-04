import deepEqual from "deep-equal";

/**
 * Waits for timeout
 * @param timeout time to wait in ms
 */
export async function sleep(timeout?: number): Promise<void> {
    await (new Promise((resolve) => {
        setTimeout(() => resolve, timeout ? timeout : 100);
    }));
}

/**
 * Deletes first entry of value in target
 * @param target from where to delete
 * @param value what to delete
 * @returns true if anything has been delete, false otherwise
 */
export function findAndDelete(target: {[ket: string]: any, [Symbol.iterator]: any} | any[], value: any): boolean {
    if (Array.isArray(target)) {
        for (let i = 0; i < target.length; i++) {
            if (deepEqual(target[i], value)) {
                target.splice(i, 1);
                return true;
            }
        }
    } else {
        for (const key of target) {
            if (deepEqual(target[key], value)) {
                delete target[key];
                return true;
            }
        }
    }
    return false;
}

/**
 * Deletes all entries of value in target
 * @param target from what
 * @param value what to  delete
 * @returns true if anything has been delete, false otherwise
 */
export function findAndDeleteAll(target: {[ket: string]: any, [Symbol.iterator]: any} | any[], value: any): boolean {
    let result: boolean = false;
    while (findAndDelete(target, value)) {
        result = true;
    }
    return result;
}
