import * as path from 'path';
import { NextFunction, Request, Response } from 'express';


declare global { // declare global is TS specific, it is not the Node global!   
    var __basedir: any;
    var __path: any;
    var __stack: any;
    var __line: any;
    var __route: any;
    var __function: any;
}
const hasOwn = Object.prototype.hasOwnProperty;

if (!hasOwn.call(global, '__basedir')) {
    global.__basedir = __dirname;
}
if (!hasOwn.call(global, '__path')) {
    global.__path = path;
}
if (!hasOwn.call(global, '__route')) {
    global.__route = (req: Request): string => {
        return req.originalUrl;
    }
}

if (!hasOwn.call(global, '__stack')) {
    Object.defineProperty(global, '__stack', {
        get: function () {
            const orig = Error.prepareStackTrace;
            Error.prepareStackTrace = (_, stack) => stack
            const err = new Error();
            Error.captureStackTrace(err);
            const stack = err.stack;
            Error.prepareStackTrace = orig;
            return stack;
        },
        configurable: true
    });
}

if (!hasOwn.call(global, '__line')) {
    Object.defineProperty(global, '__line', {
        get: function () {
            return __stack[1].getLineNumber();
        },
        configurable: true
    });
}

if (!hasOwn.call(global, '__function')) {
    Object.defineProperty(global, '__function', {
        get: function () {
            return __stack[1].getFunctionName();
        },
        configurable: true
    });
}

// DTOs
export * from './_dtos';
// Utilities
export * from './_utils';
// Rate-Limiter
// export * from './middlewares/rate-limit';

// Errors
export * from './errors';

export * from './middlewares';

export * from './events';
// Database 
export * from './database';
/** Configurations */
export * from './config';
// Services
export * from './services';
// Export any gRPC protos using the proto-loader
export * from './grpc';