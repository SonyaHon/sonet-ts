"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const v1_1 = __importDefault(require("uuid/v1"));
/**
 * [[include: events_c.md]]
 */
class Events {
    constructor() {
        this.middlewaresBeforeCallbackExecution = [];
        this.middlewaresAfterCallbackExecution = [];
        // @ts-ignore
        this.callbacks = {};
    }
    /**
     * Appends middleware to Events instance
     * @param middleware middleware to append
     * @param after if its before middleware or after middleware
     * @returns uuid of appended middleware
     */
    use(middleware, after) {
        const id = v1_1.default();
        if (after) {
            this.middlewaresAfterCallbackExecution[id] = middleware;
        }
        else {
            this.middlewaresBeforeCallbackExecution[id] = middleware;
        }
        return id;
    }
    /**
     * Deletes middleware from Events instance if id is not provided, deletes all middlewares
     * @param id what to delete
     * @param options describes which middlewares to delete
     */
    unUse(id, options) {
        if (id === null) {
            if (!options) {
                this.middlewaresBeforeCallbackExecution = [];
                this.middlewaresAfterCallbackExecution = [];
            }
            else {
                if (options.after) {
                    this.middlewaresAfterCallbackExecution = [];
                }
                if (options.before) {
                    this.middlewaresBeforeCallbackExecution = [];
                }
            }
            return;
        }
        if (this.middlewaresAfterCallbackExecution[id]) {
            delete this.middlewaresAfterCallbackExecution[id];
            return;
        }
        if (this.middlewaresBeforeCallbackExecution[id]) {
            delete this.middlewaresBeforeCallbackExecution[id];
        }
    }
    /**
     * Subscribes Events instance to the event, callback can return some value, callback can be async
     * @param eventName
     * @param callback
     */
    on(eventName, callback) {
        const id = v1_1.default();
        if (!this.callbacks[eventName]) {
            this.callbacks[eventName] = {};
        }
        this.callbacks[eventName][id] = callback;
        return id;
    }
    /**
     * Removes one or more or all listeners of the event
     * @param eventName
     * @param id
     */
    removeListener(eventName, id) {
        if (!this.callbacks[eventName]) {
            return;
        }
        if (!id) {
            delete this.callbacks[eventName];
            return;
        }
        if (Array.isArray(id)) {
            for (const i in id) {
                if (this.callbacks[eventName][i]) {
                    delete this.callbacks[eventName][i];
                }
            }
        }
        else {
            if (this.callbacks[eventName][id]) {
                delete this.callbacks[eventName][id];
            }
        }
    }
    /**
     * Fires event
     * @param eventName
     * @param args
     */
    async fire(eventName, ...args) {
        let nextArgs = args;
        for (const key in this.middlewaresBeforeCallbackExecution) {
            const r = await this.middlewaresBeforeCallbackExecution[key](eventName, nextArgs);
            if (r && r.preventNext) {
                return r.result;
            }
            else {
                nextArgs = r;
            }
        }
        let res = [];
        for (const key in this.callbacks[eventName]) {
            res.push(await this.callbacks[eventName][key](...nextArgs));
        }
        if (res.length === 0) {
            res = undefined;
        }
        else if (res.length === 1) {
            res = res[0];
        }
        let initial = args;
        for (const key in this.middlewaresAfterCallbackExecution) {
            const r = await this.middlewaresAfterCallbackExecution[key](eventName, initial, nextArgs, res);
            if (r && r.preventNext) {
                return r.result;
            }
            else {
                initial = res;
            }
        }
        return res;
    }
}
exports.Events = Events;
//# sourceMappingURL=events.js.map