export interface IWebapiServerOptions {
    serveSocketIOClient: boolean;
    useCrypto: boolean;
    socketIOPath: string;
    port: number;
}
export declare class WebapiServer {
    private app;
    private http;
    private options;
    private incomingPacketBeforeMiddlewares;
    private incomingPacketAfterMIddlewares;
    private outcomingPacketBeforeMiddlewares;
    private outcomingPacketAfterMIddlewares;
    constructor(options: IWebapiServerOptions);
    listen(): Promise<void>;
}
