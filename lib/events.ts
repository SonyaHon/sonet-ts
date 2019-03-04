import uuid from "uuid/v1";

export interface IMeta {
    preventNext: true;
    [key: string]: any;
}

export interface IUnUseOptions {
    before?: boolean;
    after?: boolean;
}

/**
 * Function should return an array of new arguments or an object with [[IMeta]] field
 */
export type MWFunctionBefore = (eventName: string, args: any[]) => any[] | IMeta;
export type MWFunctionAfter  =
    (eventName: string, initialArgs: any[], finalArgs: any[], callbackResults: any[] | undefined) => any | IMeta;

/**
 * [[include: events_c.md]]
 */
export class Events {
    private middlewaresBeforeCallbackExecution: {[key: string]: any, [Symbol.iterator]: any};
    private middlewaresAfterCallbackExecution: {[key: string]: any, [Symbol.iterator]: any};
    private readonly callbacks: {[key: string]: any, [Symbol.iterator]: any};

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
    public use(middleware: MWFunctionBefore | MWFunctionAfter, after?: true): string {
        const id: string = uuid();
        if (after) {
            this.middlewaresAfterCallbackExecution[id] = middleware;
        } else {
            this.middlewaresBeforeCallbackExecution[id] = middleware;
        }
        return id;
    }

    /**
     * Deletes middleware from Events instance if id is not provided, deletes all middlewares
     * @param id what to delete
     * @param options describes which middlewares to delete
     */
    public unUse(id: string | null, options?: IUnUseOptions): void {
        if (id === null) {
            if (!options) {
                this.middlewaresBeforeCallbackExecution = [];
                this.middlewaresAfterCallbackExecution = [];
            } else {
                if (options.after) { this.middlewaresAfterCallbackExecution = []; }
                if (options.before) { this.middlewaresBeforeCallbackExecution = []; }
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
    public on(eventName: string, callback: Function): string {
        const id: string = uuid();
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
    public removeListener(eventName: string, id?: string | string[]): void {
        if (!this.callbacks[eventName]) { return; }
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
        } else {
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
    public async fire(eventName: string, ...args: any): Promise<any> {
        let nextArgs: any[] = args;
        for (const key of this.middlewaresBeforeCallbackExecution) {
            const r = await this.middlewaresBeforeCallbackExecution[key](eventName, nextArgs);
            if (r && r.preventNext) {
                return r;
            } else {
                nextArgs = r;
            }
        }
        let res: any[] | any = [];
        for (const key of this.callbacks[eventName]) {
            res.push(await this.callbacks[eventName][key](...args));
        }
        if (res.length === 0) {
            res = undefined;
        } else if (res.length === 1) {
            res = res[0];
        }
        let initial: any[] = args;
        for (const key of this.middlewaresAfterCallbackExecution) {
            const r =  await this.middlewaresAfterCallbackExecution[key](eventName, initial, nextArgs, res);
            if (r && r.preventNext) {
                return r;
            } else {
                initial = res;
            }
        }
        return res;
    }
}
