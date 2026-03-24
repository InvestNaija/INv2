"use strict";
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitmqWrapper = void 0;
exports.rabbitmqWrapper = {
    connect: jest.fn().mockImplementation(() => this),
    connection: {
        createChannel: jest.fn().mockImplementation(() => {
            return {
                assertExchange: jest.fn().mockImplementation(),
                publish: jest.fn().mockImplementation((exchangeName, subject, message) => true)
            };
        }),
    }
};
