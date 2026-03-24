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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = setup;
exports.getDbCxn = getDbCxn;
const sequelize_typescript_1 = require("sequelize-typescript");
const typeorm_1 = require("typeorm");
const env = process.env.NODE_ENV || 'development';
const config_1 = __importDefault(require("./config"));
console.log(`Environment: ${env}`);
const config = config_1.default;
const databases = Object.keys(config[env].databases);
const cxn = {};
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const database of databases) {
            const dbPath = config[env].databases[database];
            if (dbPath['models']) {
                /**
                 * Sequelize
                 */
                cxn[database] = new sequelize_typescript_1.Sequelize(Object.assign(Object.assign({}, dbPath), { sync: { alter: true }, modelMatch: (filename, member) => {
                        const replaced = filename.replace(/-/g, '');
                        return replaced.substring(0, replaced.indexOf('.model')) === member.toLowerCase();
                    }, logging: (env !== 'production' ? true : false) }));
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
            }
            else if (dbPath['entities']) {
                /**
                 * TypeORM
                 */
                cxn[database] = new typeorm_1.DataSource(Object.assign(Object.assign({}, dbPath), { logging: env !== 'production', synchronize: false }));
                cxn[database].initialize()
                    .then(() => {
                    console.log(`${database} connected...`);
                })
                    .catch((err) => {
                    console.error(`Error connecting to ${database} =>`, err.message);
                });
            }
        }
    });
}
;
function getDbCxn(type = 'pgINv2') {
    return cxn[type];
}
