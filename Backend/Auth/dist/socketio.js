"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketIO = void 0;
const socket_io_1 = require("socket.io");
const common_1 = require("@inv2/common");
class SocketIO {
    get client() {
        if (!this.cxn)
            throw new common_1.Exception({ code: 500, message: 'Cannot connecting to SocketIO' });
        return this.cxn;
    }
    connect(svr) {
        this.cxn = new socket_io_1.Server(svr, { cors: { origin: '*' } });
        return new Promise((resolve, reject) => {
            this.client.on('connection', () => {
                console.log('Connected to socket');
                resolve();
            });
            this.client.on('error', (error) => {
                reject(error);
            });
        });
    }
}
exports.socketIO = new SocketIO;
