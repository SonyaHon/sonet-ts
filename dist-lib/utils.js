"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deep_equal_1 = __importDefault(require("deep-equal"));
/**
 * Waits for timeout
 * @param timeout time to wait in ms
 */
async function sleep(timeout) {
    await (new Promise((resolve) => {
        setTimeout(() => resolve, timeout ? timeout : 100);
    }));
}
exports.sleep = sleep;
/**
 * Deletes first entry of value in target
 * @param target from where to delete
 * @param value what to delete
 * @returns true if anything has been delete, false otherwise
 */
function findAndDelete(target, value) {
    if (Array.isArray(target)) {
        for (let i = 0; i < target.length; i++) {
            if (deep_equal_1.default(target[i], value)) {
                target.splice(i, 1);
                return true;
            }
        }
    }
    else {
        for (const key of target) {
            if (deep_equal_1.default(target[key], value)) {
                delete target[key];
                return true;
            }
        }
    }
    return false;
}
exports.findAndDelete = findAndDelete;
/**
 * Deletes all entries of value in target
 * @param target from what
 * @param value what to  delete
 * @returns true if anything has been delete, false otherwise
 */
function findAndDeleteAll(target, value) {
    let result = false;
    while (findAndDelete(target, value)) {
        result = true;
    }
    return result;
}
exports.findAndDeleteAll = findAndDeleteAll;
//# sourceMappingURL=utils.js.map