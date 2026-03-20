"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const path = __importStar(require("path"));
// import { User } from './sequelize/INv2';
const Config = {
    "postgres": {
        "host": process.env.DB_PG_HOST,
        "database": process.env.DB_PG_DB_NAME,
        "username": process.env.DB_PG_USERNAME,
        "password": process.env.DB_PG_PASSWORD,
        "port": process.env.DB_PG_PORT,
        "timezone": process.env.DB_PG_TIMEZONE,
        "dialect": "postgres",
        "ssl": true,
        "rejectUnauthorized": false,
        "dialectOptions": {
            "ssl": {
                "require": true,
                "rejectUnauthorized": false
            }
        }
    },
    "development": {
        "databases": {
            /** Sequelize */
            "pgINv2": {
                "host": process.env.DB_PG_HOST,
                "database": process.env.DB_PG_DB_NAME,
                "username": process.env.DB_PG_USERNAME,
                "password": process.env.DB_PG_PASSWORD,
                "port": process.env.DB_PG_PORT,
                "timezone": process.env.DB_PG_TIMEZONE,
                "models": [__dirname + '/sequelize/INv2/models/*.model.ts'],
                "dialect": "postgres",
                "ssl": true,
                "rejectUnauthorized": false,
                "dialectOptions": {
                    "ssl": {
                        "require": true,
                        "rejectUnauthorized": false
                    }
                }
            },
            /** TypeORM */
            toINv2: {
                type: "postgres",
                host: process.env.DB_PG_HOST,
                username: process.env.DB_PG_USERNAME,
                password: process.env.DB_PG_PASSWORD,
                database: process.env.DB_PG_DB_NAME,
                port: process.env.DB_PG_PORT,
                entities: [
                    __dirname + `/typeorm/INv2/**/*.entity{.ts,.js}`
                ],
                // migrations: [
                //    __dirname + `/migrations/typeorm/INv2/*.ts`
                // ]
                ssl: true,
                extra: {
                    ssl: {
                        "rejectUnauthorized": false
                    }
                },
            }
        },
    },
    "staging": {
        "databases": {
            /** Sequelize */
            "pgINv2": {
                "host": process.env.DB_PG_HOST,
                "database": process.env.DB_PG_DB_NAME,
                "username": process.env.DB_PG_USERNAME,
                "password": process.env.DB_PG_PASSWORD,
                "port": process.env.DB_PG_PORT,
                "dialect": "postgres",
                "timezone": process.env.DB_PG_TIMEZONE,
                "models": [__dirname + `/sequelize/INv2/models`],
                "ssl": true,
                "rejectUnauthorized": false,
                "dialectOptions": {
                    "ssl": {
                        "require": true,
                        "rejectUnauthorized": false
                    }
                }
            },
        },
    },
    "production": {
        "databases": {
            /** Sequelize */
            "pgINv2": {
                "host": process.env.DB_PG_HOST,
                "database": process.env.DB_PG_DB_NAME,
                "username": process.env.DB_PG_USERNAME,
                "password": process.env.DB_PG_PASSWORD,
                "port": process.env.DB_PG_PORT,
                "timezone": process.env.DB_PG_TIMEZONE,
                "dialect": "postgres",
                "models": [path.resolve(__dirname + `/sequelize/`) + '/**/*.entity{.ts,.js}'],
                "ssl": true,
                "rejectUnauthorized": false,
                "dialectOptions": {
                    "ssl": {
                        "require": true,
                        "rejectUnauthorized": false
                    }
                }
            },
        },
    },
};
module.exports = Config;
