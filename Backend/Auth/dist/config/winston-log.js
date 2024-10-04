"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const winston_transport_1 = __importDefault(require("winston-transport"));
class INv2Transport extends winston_transport_1.default {
    constructor(opts) {
        super(opts);
        //
        // Consume any custom options here. e.g.:
        // - Connection information for databases
        // - Authentication information for APIs (e.g. loggly, papertrail, logentries, etc.).
        //
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        console.log(info);
        // Perform the writing to the remote service
        callback();
    }
}
;
const logger = (0, winston_1.createLogger)({
    level: 'info',
    transports: [
        new winston_1.transports.Console(),
        new INv2Transport({
            level: 'info',
            endpoint: 'none'
        })
    ],
    format: winston_1.format.combine(
    // format.colorize(),
    winston_1.format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }), winston_1.format.json(), winston_1.format.prettyPrint(), winston_1.format.errors({ stack: true })),
    defaultMeta: { service: 'Auth' }
});
exports.logger = logger;
