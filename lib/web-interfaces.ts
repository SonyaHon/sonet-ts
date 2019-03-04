import {Events} from "./events";

export enum EPacketType {
    INCOMING,
    OUTCOMING,
    INCOMING_RETURN,
    OUTCOMING_RETURN,
}

export interface ISocket extends Events {
    getId: Function;
    send: Function;
    disconnect: Function;
    reconnect: Function;
}

export interface IPacket {
    $$packet: true;
    type: EPacketType;
    id: string;
    data: {
        eventName: string,
        data: any[],
    };
}
