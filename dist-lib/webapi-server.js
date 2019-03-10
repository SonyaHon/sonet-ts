"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ip_1 = __importDefault(require("ip"));
const socket_io_1 = __importDefault(require("socket.io"));
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
class WebapiServer extends events_1.Events {
    constructor(options) {
        super();
        this.app = null;
        this.http = null;
        this.io = null;
        this.options = {
            port: 8080,
            serveSocketIOClient: true,
            socketIOPath: "/",
            useCrypto: false,
        };
        this.incomingPacketBeforeMiddlewares = {};
        this.incomingPacketAfterMIddlewares = {};
        this.outcomingPacketBeforeMiddlewares = {};
        this.outcomingPacketAfterMIddlewares = {};
        this.onConnect = null;
        this.onDisconnect = null;
        this.connectedSockets = {};
        for (const key in options) {
            this.options[key] = options[key];
        }
        this.app = express_1.default();
        this.http = new http_1.default.Server(this.app);
        this.io = socket_io_1.default(this.http, {
            path: this.options.socketIOPath,
            serveClient: this.options.serveSocketIOClient,
        });
        this.io.on("connection", (socket) => {
            this.connectionHandler(socket);
        });
        this.use(this.outcommingMiddleware.bind(this));
        this.use(this.incommingMiddleware.bind(this));
        this.use(this.incommingMiddlewareAfter.bind(this), true);
    }
    static createPacket(type, id, eventName, args) {
        return {
            $$from: "s",
            $$packet: true,
            data: {
                data: args,
                eventName,
            },
            id: id ? id : v1_1.default(),
            type,
        };
    }
    useInc(middleware, after) {
        const id = v1_1.default();
        if (after) {
            this.incomingPacketAfterMIddlewares[id] = middleware;
        }
        else {
            this.incomingPacketBeforeMiddlewares[id] = middleware;
        }
        return id;
    }
    useOut(middleware, after) {
        const id = v1_1.default();
        if (after) {
            this.outcomingPacketAfterMIddlewares[id] = middleware;
        }
        else {
            this.outcomingPacketBeforeMiddlewares[id] = middleware;
        }
        return id;
    }
    unUse(id) {
        if (this.outcomingPacketBeforeMiddlewares[id]) {
            delete this.outcomingPacketBeforeMiddlewares[id];
        }
        else if (this.outcomingPacketAfterMIddlewares[id]) {
            delete this.outcomingPacketAfterMIddlewares[id];
        }
        else if (this.incomingPacketBeforeMiddlewares[id]) {
            delete this.incomingPacketBeforeMiddlewares[id];
        }
        else if (this.incomingPacketAfterMIddlewares[id]) {
            delete this.incomingPacketAfterMIddlewares[id];
        }
    }
    setOnConnect(handler) {
        this.onConnect = handler;
    }
    unsetOnConnect() {
        this.onConnect = null;
    }
    setOnDisconnect(handler) {
        this.onDisconnect = handler;
    }
    unsetOnDisconnect() {
        this.onDisconnect = null;
    }
    getApp() {
        return this.app;
    }
    async listen() {
        const pr = new Promise((resolve) => {
            this.http.listen(this.options.port, () => {
                resolve();
            });
        });
        await pr;
        console.log(`Server is listening on http://127.0.0.1:${this.options.port}`, `http://${ip_1.default.address()}:${this.options.port}`);
    }
    async fire(socketId, eventName, ...args) {
        return super.fire(eventName, WebapiServer.createPacket(web_interfaces_1.EPacketType.SERVER, null, eventName, args), socketId);
    }
    broadcast(eventName, ...args) {
        for (const socketId in this.connectedSockets) {
            super.fire(eventName, WebapiServer.createPacket(web_interfaces_1.EPacketType.SERVER, null, eventName, args), socketId);
        }
    }
    connectionHandler(socket) {
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
        socket.on(String(web_interfaces_1.EPacketType.CLIENT), (packet) => {
            super.fire(packet.data.eventName, packet, socket);
        });
    }
    disconnectHandler(socketId) {
        delete this.connectedSockets[socketId];
    }
    async incommingMiddleware(eventName, args) {
        if (!(args[0] && args[0].$$packet)) {
            return args;
        }
        const packet = args[0];
        if (packet.type !== web_interfaces_1.EPacketType.CLIENT) {
            return args;
        }
        return packet.data.data;
    }
    async incommingMiddlewareAfter(eventName, argsI, argsF, clbRes) {
        if (!(argsI[0] && argsI[0].$$packet)) {
            return;
        }
        const initialPacket = argsI[0];
        const socket = argsI[1];
        socket.emit(initialPacket.id, clbRes);
        return { preventNext: true, result: undefined };
    }
    async outcommingMiddleware(eventName, args) {
        if (!(args[0] && args[0].$$packet)) {
            return args;
        }
        const packet = args[0];
        if (packet.type !== web_interfaces_1.EPacketType.SERVER) {
            return args;
        }
        const socket = this.connectedSockets[args[1]];
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
exports.WebapiServer = WebapiServer;
//# sourceMappingURL=webapi-server.js.map