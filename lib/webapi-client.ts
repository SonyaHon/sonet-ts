import UUID from "uuid/v1";
import {Events} from "./events";
import {EPacketType, IPacket} from "./web-interfaces";

export enum EWAMiddleware {
    INCOMING_BEFORE,
    INCOMING_AFTER,
    OUTCOMING_BEFORE,
    OUTCOMING_AFTER,
}

export class WebapiClient extends Events {

    private static createPacket(type: EPacketType, id: string | null, eventName: string, args: any): IPacket {
        return {
            $$from: "c",
            $$packet: true,
            data: {
                data: args,
                eventName,
            },
            id: id ? id : UUID(),
            type,
        };
    }

    private incomingPacketBeforeMiddlewares: Function[] = [];
    private incomingPacketAfterMIddlewares: Function[] = [];
    private outcomingPacketBeforeMiddlewares: Function[] = [];
    private outcomingPacketAfterMIddlewares: Function[] = [];

    private socket: any = null;

    constructor(socket: any) {
        super();
        this.socket = socket;
        this.use(this.outcommingMiddleware.bind(this));
        this.use(this.incommingMiddleware.bind(this));
        this.use(this.incommingMiddlewareAfter.bind(this), true);
        this.socket.on(String(EPacketType.SERVER), (packet: any) => {
            super.fire(packet.data.eventName, packet);
        });
    }

    public async fire(eventName: string, ...args: any[]) {
        return super.fire(eventName, WebapiClient.createPacket(EPacketType.CLIENT, null, eventName, args));
    }

    private async incommingMiddleware(eventName: string, args: any[]): Promise<any> {
        if (!(args[0] && args[0].$$packet)) {
            return args;
        }
        const packet: IPacket = args[0];
        if (packet.type !== EPacketType.SERVER) {
            return args;
        }
        return packet.data.data;
    }

    private async incommingMiddlewareAfter(eventName: string, argsI: any[], argsF: any[], clbRes: any[]): Promise<any> {
        if (!(argsI[0] && argsI[0].$$packet)) {
            return;
        }
        const initialPacket = argsI[0];
        this.socket.emit(initialPacket.id, clbRes);
        return {preventNext: true, result: undefined};
    }

    private async outcommingMiddleware(eventName: string, args: any[]): Promise<any> {
        if (!(args[0] && args[0].$$packet)) {
            return args;
        }
        const packet: IPacket = args[0];
        if (packet.type !== EPacketType.CLIENT) { return args; }
        const pr = new Promise((resolve) => {
            this.socket.once(packet.id, (dt: any) => {
                resolve(dt);
            });
        });
        this.socket.emit(String(packet.type), packet);
        return {
            preventNext: true,
            result: await pr,
        };
    }
}
