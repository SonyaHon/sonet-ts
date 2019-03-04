import { Events } from "./events";
export interface IWebapiServerOptions {
    serveSocketIOClient: boolean;
    useCrypto: boolean;
    socketIOPath: string;
    port: number;
    [key: string]: any;
}
export declare enum EWAMiddleware {
    INCOMING_BEFORE = 0,
    INCOMING_AFTER = 1,
    OUTCOMING_BEFORE = 2,
    OUTCOMING_AFTER = 3
}
export declare class WebapiServer extends Events {
    private static createPacket;
    private app;
    private http;
    private io;
    private options;
    private incomingPacketBeforeMiddlewares;
    private incomingPacketAfterMIddlewares;
    private outcomingPacketBeforeMiddlewares;
    private outcomingPacketAfterMIddlewares;
    private connectedSockets;
    constructor(options: IWebapiServerOptions);
    getApp(): any;
    listen(): Promise<void>;
    fire(socketId: string, eventName: string, ...args: any): Promise<any>;
    broadcast(eventName: string, ...args: any): void;
    private connectionHandler;
    private disconnectHandler;
    private incomingMiddleware;
    private outcomingMiddleware;
}
