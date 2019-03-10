import { Events } from "./events";
export declare enum EWAMiddleware {
    INCOMING_BEFORE = 0,
    INCOMING_AFTER = 1,
    OUTCOMING_BEFORE = 2,
    OUTCOMING_AFTER = 3
}
export declare class WebapiClient extends Events {
    private static createPacket;
    private incomingPacketBeforeMiddlewares;
    private incomingPacketAfterMIddlewares;
    private outcomingPacketBeforeMiddlewares;
    private outcomingPacketAfterMIddlewares;
    private socket;
    constructor(socket: any);
    fire(eventName: string, ...args: any[]): Promise<any>;
    private incommingMiddleware;
    private incommingMiddlewareAfter;
    private outcommingMiddleware;
}
