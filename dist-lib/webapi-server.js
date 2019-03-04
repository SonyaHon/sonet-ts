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
        this.incomingPacketBeforeMiddlewares = [];
        this.incomingPacketAfterMIddlewares = [];
        this.outcomingPacketBeforeMiddlewares = [];
        this.outcomingPacketAfterMIddlewares = [];
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
        this.use(this.incomingMiddleware);
        this.use(this.outcomingMiddleware);
    }
    static createPacket(type, eventName, ...args) {
        return {
            $$packet: true,
            data: {
                data: args,
                eventName,
            },
            id: v1_1.default(),
            type,
        };
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
        return await super.fire(eventName, WebapiServer.createPacket(web_interfaces_1.EPacketType.OUTCOMING, args), socketId);
    }
    broadcast(eventName, ...args) {
        for (const socketId in this.connectedSockets) {
            super.fire(eventName, WebapiServer.createPacket(web_interfaces_1.EPacketType.OUTCOMING, args), socketId);
        }
    }
    connectionHandler(socket) {
        this.connectedSockets[socket.id] = socket;
        socket.on("disconnect", () => {
            this.disconnectHandler(socket.id);
        });
    }
    disconnectHandler(socketId) {
        delete this.connectedSockets[socketId];
    }
    async incomingMiddleware(eventName, args) {
        if (!(args.length === 1 && args[0] && args[0].$$packet)) {
            return args;
        }
    }
    async outcomingMiddleware(eventName, args) {
        if (!(args.length === 1 && args[0] && args[0].$$packet)) {
            return args;
        }
    }
}
exports.WebapiServer = WebapiServer;
//# sourceMappingURL=webapi-server.js.map