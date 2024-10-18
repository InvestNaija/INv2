"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
// CREATE SCHEMA public;
// GRANT ALL ON SCHEMA public TO public;
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
const sequelize_typescript_1 = require("sequelize-typescript");
// import { DataSource } from "typeorm";
const env = process.env.NODE_ENV || 'development';
const config_1 = __importDefault(require("./config"));
console.log(`Environment: ${env}`);
const config = config_1.default;
const databases = Object.keys(config[env].databases);
const cxn = {};
const load = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const database of databases) {
        /**
         * Sequelize
         */
        const dbPath = config[env].databases[database];
        cxn[database] = new sequelize_typescript_1.Sequelize(Object.assign(Object.assign({}, dbPath), { sync: { alter: true } }));
        if (env !== 'production') {
            console.log(dbPath);
            yield cxn[database].sync({ alter: true });
        }
        ;
        cxn[database].authenticate()
            .then(() => console.log(`${database} connected....`))
            .catch((err) => {
            console.log(`Error connecting to ${database}...${err.message}`);
            // Logger.error({status: err.code??500, message: `Error connecting to ${database}...${err.message}`})
        });
        /**
         * TypeORM
         */
        // cxn[database] = new DataSource({
        //    ...dbPath,
        //    // sync: { alter},
        // });
        // cxn[database].initialize()
        //    .then(() => {
        //       console.log(`${database} connected...`);
        //    })
        //    .catch((err: any) => {
        //       console.error(`Error connecting to ${database} =>`, err.message);
        //    });
    }
});
load();
module.exports = cxn;
