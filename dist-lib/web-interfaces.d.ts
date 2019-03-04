import { Events } from "./events";
export interface ISocket extends Events {
    getId: Function;
    send: Function;
    disconnect: Function;
    reconnect: Function;
}
export interface IConnectionManager extends Events {
}
export interface IPacket {
}
