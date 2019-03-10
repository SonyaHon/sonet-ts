import { Events } from "./events";
export declare enum EPacketType {
    SERVER = 0,
    CLIENT = 1
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
        eventName: string;
        data: any[];
    };
}
