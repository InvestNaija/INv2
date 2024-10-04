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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const rabbitmq_wrapper_1 = require("../../rabbitmq.wrapper");
it(`Returns 400 if required params are not supplied`, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/v2/auth/user/signup')
        .send({
        firstName: "Abimbs",
        lastName: "Hans",
        phone: "yygiyggy23",
        password: "W8SNi8zxlU5FHmgLr9hN0A=="
    })
        .expect(400);
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/v2/auth/user/signup')
        .send({
        "firstName": "Abimbs",
        "lastName": "Hans",
        "email": "a@b.com",
        "phone": "yygiyggy23",
    })
        .expect(400);
}), 20000);
it(`Returns 201 on successful signup`, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/v2/auth/user/signup')
        .send({
        "firstName": "Abimbs",
        "lastName": "Hans",
        "phone": "yygiyggy23",
        "email": "a@b.com",
        "password": "W8SNi8zxlU5FHmgLr9hN0A=="
    })
        .expect(200);
    expect((yield rabbitmq_wrapper_1.rabbitmqWrapper.connection.createChannel()).publish).toHaveBeenCalled();
}), 20000);
