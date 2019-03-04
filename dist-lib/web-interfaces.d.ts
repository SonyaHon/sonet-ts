import { Events } from "./events";
export declare enum EPacketType {
    INCOMING = 0,
    OUTCOMING = 1,
    INCOMING_RETURN = 2,
    OUTCOMING_RETURN = 3
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
        eventName: string;
        data: any[];
    };
}
