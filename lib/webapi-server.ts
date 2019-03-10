import express from "express";
import HTTP from "http";
import ip from "ip";
import IO, {Socket} from "socket.io";
import UUID from "uuid/v1";
import {Events} from "./events";
import Func = Mocha.Func;
import {findAndDelete} from "./utils";
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

    private static createPacket(type: EPacketType, id: string | null, eventName: string, args: any): IPacket {
        return {
            $$from: "s",
            $$packet: true,
            data: {
                data: args,
                eventName,
            },
            id: id ? id : UUID(),
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

    private incomingPacketBeforeMiddlewares: {[key: string]: Function} = {};
    private incomingPacketAfterMIddlewares: {[key: string]: Function} = {};
    private outcomingPacketBeforeMiddlewares: {[key: string]: Function} = {};
    private outcomingPacketAfterMIddlewares: {[key: string]: Function} = {};

    private onConnect: Function | null = null;
    private onDisconnect: Function | null = null;

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

        this.use(this.outcommingMiddleware.bind(this));
        this.use(this.incommingMiddleware.bind(this));
        this.use(this.incommingMiddlewareAfter.bind(this), true);
    }

    public useInc(middleware: Function, after?: boolean): string {
        const id: string = UUID();
        if (after) {
            this.incomingPacketAfterMIddlewares[id] = middleware;
        } else {
            this.incomingPacketBeforeMiddlewares[id] = middleware;
        }
        return id;
    }

    public useOut(middleware: Function, after?: boolean): string {
        const id: string = UUID();
        if (after) {
            this.outcomingPacketAfterMIddlewares[id] = middleware;
        } else {
            this.outcomingPacketBeforeMiddlewares[id] = middleware;
        }
        return id;
    }

    public unUse(id: string): void {
        if (this.outcomingPacketBeforeMiddlewares[id]) {
            delete this.outcomingPacketBeforeMiddlewares[id];
        } else if (this.outcomingPacketAfterMIddlewares[id]) {
            delete this.outcomingPacketAfterMIddlewares[id];
        } else if (this.incomingPacketBeforeMiddlewares[id]) {
            delete this.incomingPacketBeforeMiddlewares[id];
        } else if (this.incomingPacketAfterMIddlewares[id]) {
            delete this.incomingPacketAfterMIddlewares[id];
        }
    }

    public setOnConnect(handler: Function): void {
        this.onConnect = handler;
    }

    public unsetOnConnect(): void {
        this.onConnect = null;
    }

    public setOnDisconnect(handler: Function): void {
        this.onDisconnect = handler;
    }

    public unsetOnDisconnect(): void {
        this.onDisconnect = null;
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
        return super.fire(eventName, WebapiServer.createPacket(EPacketType.SERVER, null, eventName, args), socketId);
    }

    public broadcast(eventName: string, ...args: any): void {
        for (const socketId in this.connectedSockets) {
            super.fire(eventName, WebapiServer.createPacket(EPacketType.SERVER, null, eventName, args), socketId);
        }
    }

    private connectionHandler(socket: Socket): void {
        this.connectedSockets[socket.id] = socket;
        if (this.onConnect) {
            this.onConnect(socket.id);
        }
        socket.on("disconnect", () => {
            if (this.onDisconnect) {
                this.onDisconnect(socket.id);
            }
            this.disconnectHandler(socket.id);
        });
        socket.on(String(EPacketType.CLIENT), (packet) => {
            super.fire(packet.data.eventName, packet, socket);
        });
    }

    private disconnectHandler(socketId: string): void {
        delete this.connectedSockets[socketId];
    }

    private async incommingMiddleware(eventName: string, args: any[]): Promise<any> {
        if (!(args[0] && args[0].$$packet)) {
            return args;
        }
        const packet: IPacket = args[0];
        if (packet.type !== EPacketType.CLIENT) {
            return args;
        }
        return packet.data.data;
    }

    private async incommingMiddlewareAfter(eventName: string, argsI: any[], argsF: any[], clbRes: any[]): Promise<any> {
        if (!(argsI[0] && argsI[0].$$packet)) {
            return;
        }
        const initialPacket = argsI[0];
        const socket = argsI[1];
        socket.emit(initialPacket.id, clbRes);
        return {preventNext: true, result: undefined};
    }

    private async outcommingMiddleware(eventName: string, args: any[]): Promise<any> {
        if (!(args[0] && args[0].$$packet)) {
            return args;
        }
        const packet: IPacket = args[0];
        if (packet.type !== EPacketType.SERVER) { return args; }
        const socket: Socket = this.connectedSockets[args[1]];
        const pr = new Promise((resolve) => {
            socket.once(packet.id, (dt) => {
                resolve(dt);
            });
        });
        socket.emit(String(packet.type), packet);
        return {
            preventNext: true,
            result: await pr,
        };
    }
}
