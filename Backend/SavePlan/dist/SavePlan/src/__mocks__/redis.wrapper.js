"use strict";
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisWrapper = void 0;
exports.redisWrapper = {
    connect: jest.fn().mockImplementation(() => this),
    client: {
        setEx: jest.fn().mockImplementation(),
        get: jest.fn().mockImplementation(),
        del: jest.fn().mockImplementation(),
    }
};
