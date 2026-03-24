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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * from 'auth.setup'
const path_1 = __importDefault(require("path"));
const sequelize_typescript_1 = require("sequelize-typescript");
const seed_all_data_1 = require("../domain/sequelize/INv2/seeders/seed-all-data");
const common_1 = require("@inv2/common");
jest.mock('../rabbitmq.wrapper');
jest.mock('../redis.wrapper');
const common_2 = require("@inv2/common");
const rabbitmq_wrapper_1 = require("../rabbitmq.wrapper");
let sequelize;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.clearAllMocks();
    jest.useFakeTimers();
    common_2.INLogger.init('SavePlan', rabbitmq_wrapper_1.rabbitmqWrapper.connection);
    sequelize = new sequelize_typescript_1.Sequelize({
        dialect: "sqlite",
        // storage: __dirname+"/test.sqlite",
        storage: ":memory:",
        logging: false,
        models: [path_1.default.join(__dirname, `../database/sequelize/INv2/models`)]
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
global.getJWTAuth = (role) => {
    let user = null;
    if (role)
        user = seed_all_data_1.users.find(user => user.tenant_roles.includes(role));
    else
        user = seed_all_data_1.users[Math.floor(Math.random() * (seed_all_data_1.users.length - 1 + 0) + 0)];
    if (!user)
        return null;
    // Build a jwt payload {user, Tenant}
    const payload = {
        user: JSON.parse((user === null || user === void 0 ? void 0 : user.details) || '{user:{}}').user,
        Tenant: JSON.parse((user === null || user === void 0 ? void 0 : user.tenant_roles) || '{Tenant:{}}').Tenant,
    };
    // create a JWT
    const token = common_1.JWTService.createJWTToken(payload, process.env.ACCESS_TOKEN_SECRET, "1h");
    return token.data;
};
