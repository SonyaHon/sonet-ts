import {Events} from "./events";

export enum EPacketType {
    SERVER,
    CLIENT,
}

export interface ISocket extends Events {
    getId: Function;
    send: Function;
    disconnect: Function;
    reconnect: Function;
}

export interface IPacket {
    $$packet: true;
    $$from: string;
    type: EPacketType;
    id: string;
    data: {
        eventName: string,
        data: any[],
    };
}
