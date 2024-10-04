"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
// import * from 'auth.setup'
// import fs from "fs";
const sequelize_typescript_1 = require("sequelize-typescript");
const seed_all_data_1 = require("../database/sequelize/INv2/seeders/seed-all-data");
// declare global {
//    var getAuthCookie: () => string[];
// }
jest.mock('../rabbitmq.wrapper');
let sequelize;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.clearAllMocks();
    // process.env.ACCESS_TOKEN_SECRET = '2NjQ5fQ.BpnmhQBqzLfYf';
    // process.env.NODE_ENV = 'test'
    sequelize = new sequelize_typescript_1.Sequelize({
        dialect: "sqlite",
        // storage: __dirname+"/test.sqlite",
        storage: ":memory:",
        logging: false,
        models: [__path.join(__dirname, `../database/sequelize/INv2/models`)]
    });
    yield sequelize.sync({ force: true });
    yield sequelize.authenticate()
        .then(() => console.log(`Database connected....`))
        .catch((err) => {
        console.log(`Error connecting to Database...${err.message}`);
    });
    yield (0, seed_all_data_1.up)(sequelize.getQueryInterface());
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.clearAllMocks();
    // const collections = await mongoose.connection.db.collections();
    // for (let collection of collections) {
    //    await collection.deleteMany({});
    // }
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // if (sequelize) {
    //    await sequelize.close();
    //    // fs.unlinkSync(__dirname+"/test.sqlite");
    // }
}));
// global.getAuthCookie = ()=> {
//    // // Build a jwt payload {id, email}
//    // const payload = {
//    //    id: new mongoose.Types.ObjectId().toHexString(),
//    //    email: "a@b.com"
//    // };
//    // // create a JWT
//    // const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!);
//    // // Build session Object. {jwt: MY_JWT}
//    // const session = { jwt: token };
//    // // Turn that session into JSON
//    // const sessionJSON = JSON.stringify(session);
//    // // Take JSON and encode it as base64
//    // const base64 = Buffer.from(sessionJSON).toString('base64');
//    // // return a string that's the cookie with the encoded data
//    // return [`session=${base64}`];
// }
