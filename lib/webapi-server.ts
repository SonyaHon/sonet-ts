import express from "express";
import HTTP from "http";
import ip from "ip";
import IO, {Socket} from "socket.io";
import UUID from "uuid/v1";
import {Events} from "./events";
import {EPacketType, IPacket} from "./web-interfaces";

export interface IWebapiServerOptions {
    serveSocketIOClient: boolean;
    useCrypto: boolean;
    socketIOPath: string;
    port: number;
    [key: string]: any;
}

export enum EWAMiddleware {
    INCOMING_BEFORE,
    INCOMING_AFTER,
    OUTCOMING_BEFORE,
    OUTCOMING_AFTER,
}

export class WebapiServer extends Events {

    private static createPacket(type: EPacketType, eventName: string, ...args: any): IPacket {
        return {
            $$packet: true,
            data: {
                data: args,
                eventName,
            },
            id: UUID(),
            type,
        };
    }
    private app: any = null;
    private http: any = null;
    private io: any = null;
    private options: IWebapiServerOptions = {
        port: 8080,
        serveSocketIOClient: true,
        socketIOPath: "/",
        useCrypto: false,
    };

    private incomingPacketBeforeMiddlewares: Function[] = [];
    private incomingPacketAfterMIddlewares: Function[] = [];
    private outcomingPacketBeforeMiddlewares: Function[] = [];
    private outcomingPacketAfterMIddlewares: Function[] = [];

    private connectedSockets: {[key: string]: any} = {};

    constructor(options: IWebapiServerOptions) {
        super();

        for (const key in options) {
            this.options[key] = options[key];
        }

        this.app = express();
        this.http = new HTTP.Server(this.app);
        this.io = IO(this.http, {
            path: this.options.socketIOPath,
            serveClient: this.options.serveSocketIOClient,
        });

        this.io.on("connection", (socket: any) => {
            this.connectionHandler(socket);
        });

        this.use(this.incomingMiddleware);
        this.use(this.outcomingMiddleware);
    }

    public getApp(): any {
        return this.app;
    }

    public async listen(): Promise<void> {
        const pr = new Promise((resolve) => {
            this.http.listen(this.options.port, () => {
                resolve();
            });
        });
        await pr;
        console.log(`Server is listening on http://127.0.0.1:${this.options.port}`,
            `http://${ip.address()}:${this.options.port}`);
    }

    public async fire(socketId: string, eventName: string, ...args: any): Promise<any> {
        return await super.fire(eventName, WebapiServer.createPacket(EPacketType.OUTCOMING, args), socketId);
    }

    public broadcast(eventName: string, ...args: any): void {
        for (const socketId in this.connectedSockets) {
            super.fire(eventName, WebapiServer.createPacket(EPacketType.OUTCOMING, args), socketId);
        }
    }

    private connectionHandler(socket: Socket): void {
        this.connectedSockets[socket.id] = socket;
        socket.on("disconnect", () => {
            this.disconnectHandler(socket.id);
        });
    }

    private disconnectHandler(socketId: string): void {
        delete this.connectedSockets[socketId];
    }

    private async incomingMiddleware(eventName: string, args: any[]): Promise<any> {
        if (!(args.length === 1 && args[0] && args[0].$$packet)) {
            return args;
        }
    }

    private async outcomingMiddleware(eventName: string, args: any[]): Promise<any> {
        if (!(args.length === 1 && args[0] && args[0].$$packet)) {
            return args;
        }
    }
}
