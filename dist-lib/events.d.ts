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
export declare type MWFunctionBefore = (eventName: string, args: any[]) => any[] | IMeta;
export declare type MWFunctionAfter = (eventName: string, initialArgs: any[], finalArgs: any[], callbackResults: any[] | undefined) => any | IMeta;
/**
 * [[include: events_c.md]]
 */
export declare class Events {
    private middlewaresBeforeCallbackExecution;
    private middlewaresAfterCallbackExecution;
    private readonly callbacks;
    constructor();
    /**
     * Appends middleware to Events instance
     * @param middleware middleware to append
     * @param after if its before middleware or after middleware
     * @returns uuid of appended middleware
     */
    use(middleware: MWFunctionBefore | MWFunctionAfter, after?: true): string;
    /**
     * Deletes middleware from Events instance if id is not provided, deletes all middlewares
     * @param id what to delete
     * @param options describes which middlewares to delete
     */
    unUse(id: string | null, options?: IUnUseOptions): void;
    /**
     * Subscribes Events instance to the event, callback can return some value, callback can be async
     * @param eventName
     * @param callback
     */
    on(eventName: string, callback: Function): string;
    /**
     * Removes one or more or all listeners of the event
     * @param eventName
     * @param id
     */
    removeListener(eventName: string, id?: string | string[]): void;
    /**
     * Fires event
     * @param eventName
     * @param args
     */
    fire(eventName: string, ...args: any): Promise<any>;
}
