"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const v1_1 = __importDefault(require("uuid/v1"));
const events_1 = require("./events");
const web_interfaces_1 = require("./web-interfaces");
var EWAMiddleware;
(function (EWAMiddleware) {
    EWAMiddleware[EWAMiddleware["INCOMING_BEFORE"] = 0] = "INCOMING_BEFORE";
    EWAMiddleware[EWAMiddleware["INCOMING_AFTER"] = 1] = "INCOMING_AFTER";
    EWAMiddleware[EWAMiddleware["OUTCOMING_BEFORE"] = 2] = "OUTCOMING_BEFORE";
    EWAMiddleware[EWAMiddleware["OUTCOMING_AFTER"] = 3] = "OUTCOMING_AFTER";
})(EWAMiddleware = exports.EWAMiddleware || (exports.EWAMiddleware = {}));
class WebapiClient extends events_1.Events {
    constructor(socket) {
        super();
        this.incomingPacketBeforeMiddlewares = [];
        this.incomingPacketAfterMIddlewares = [];
        this.outcomingPacketBeforeMiddlewares = [];
        this.outcomingPacketAfterMIddlewares = [];
        this.socket = null;
        this.socket = socket;
        this.use(this.outcommingMiddleware.bind(this));
        this.use(this.incommingMiddleware.bind(this));
        this.use(this.incommingMiddlewareAfter.bind(this), true);
        this.socket.on(String(web_interfaces_1.EPacketType.SERVER), (packet) => {
            super.fire(packet.data.eventName, packet);
        });
    }
    static createPacket(type, id, eventName, args) {
        return {
            $$from: "c",
            $$packet: true,
            data: {
                data: args,
                eventName,
            },
            id: id ? id : v1_1.default(),
            type,
        };
    }
    async fire(eventName, ...args) {
        return super.fire(eventName, WebapiClient.createPacket(web_interfaces_1.EPacketType.CLIENT, null, eventName, args));
    }
    async incommingMiddleware(eventName, args) {
        if (!(args[0] && args[0].$$packet)) {
            return args;
        }
        const packet = args[0];
        if (packet.type !== web_interfaces_1.EPacketType.SERVER) {
            return args;
        }
        return packet.data.data;
    }
    async incommingMiddlewareAfter(eventName, argsI, argsF, clbRes) {
        if (!(argsI[0] && argsI[0].$$packet)) {
            return;
        }
        const initialPacket = argsI[0];
        this.socket.emit(initialPacket.id, clbRes);
        return { preventNext: true, result: undefined };
    }
    async outcommingMiddleware(eventName, args) {
        if (!(args[0] && args[0].$$packet)) {
            return args;
        }
        const packet = args[0];
        if (packet.type !== web_interfaces_1.EPacketType.CLIENT) {
            return args;
        }
        const pr = new Promise((resolve) => {
            this.socket.once(packet.id, (dt) => {
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
exports.WebapiClient = WebapiClient;
//# sourceMappingURL=webapi-client.js.map