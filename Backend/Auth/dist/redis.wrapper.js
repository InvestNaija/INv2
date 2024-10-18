"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisWrapper = void 0;
const redis_1 = require("redis");
const common_1 = require("@inv2/common");
class RedisWrapper {
    connect(url) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Trying to connect to Redis`, url);
            // Create a `node-redis` client
            this.cxn = (0, redis_1.createClient)({
                url,
                socket: {
                    reconnectStrategy: retries => Math.min(retries * 50, 1000)
                }
            });
            // // Then connect to the Redis server
            yield this.cxn.connect();
            console.log(`Connected to Redis Server`);
        });
    }
    get client() {
        if (!this.cxn)
            throw new common_1.Exception({ code: 500, message: 'Connect to Redis before getting connection' });
        return this.cxn;
    }
}
exports.redisWrapper = new RedisWrapper;
