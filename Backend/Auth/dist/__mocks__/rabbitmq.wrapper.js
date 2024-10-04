"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitmqWrapper = void 0;
exports.rabbitmqWrapper = {
    // const Args = {};
    connect: jest.fn().mockImplementation(() => this),
    connection: {
        createChannel: jest.fn().mockImplementation(() => this),
        assertExchange: jest.fn().mockImplementation((exchange, type, options) => {
            console.log(exchange, type, options);
            return this;
        }),
        publish: jest.fn().mockImplementation((exchange, routingKey, content, options) => {
            console.log(exchange, routingKey, options);
            return true;
        })
    }
};
