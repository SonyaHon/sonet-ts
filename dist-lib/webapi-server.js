"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ip_1 = __importDefault(require("ip"));
class WebapiServer {
    constructor(options) {
        this.app = null;
        this.http = null;
        this.options = {
            port: 8080,
            serveSocketIOClient: false,
            socketIOPath: "/",
            useCrypto: false,
        };
        this.incomingPacketBeforeMiddlewares = [];
        this.incomingPacketAfterMIddlewares = [];
        this.outcomingPacketBeforeMiddlewares = [];
        this.outcomingPacketAfterMIddlewares = [];
        this.app = express_1.default();
        this.http = new http_1.default.Server(this.app);
    }
    async listen() {
        const pr = new Promise((resolve) => {
            this.http.listen(this.options.port, () => {
                resolve();
            });
        });
        await pr;
        console.log(`Server is listening on http://127.0.0.1:${this.options.port} ${ip_1.default.address()}`);
    }
}
exports.WebapiServer = WebapiServer;
//# sourceMappingURL=webapi-server.js.map