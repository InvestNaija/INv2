"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const Config = {
    "postgres": {
        "database": process.env.DB_PG_DB_NAME,
        "username": process.env.DB_PG_USERNAME,
        "password": process.env.DB_PG_PASSWORD,
        "host": process.env.DB_PG_HOST,
        "dialect": "postgres",
        "timezone": process.env.DB_PG_TIMEZONE,
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
                "database": process.env.DB_PG_DB_NAME,
                "username": process.env.DB_PG_USERNAME,
                "password": process.env.DB_PG_PASSWORD,
                "host": process.env.DB_PG_HOST,
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
            /** TypeORM */
            // postgres: {
            //    type: "postgres",
            //    host: process.env.DB_PG_HOST,
            //    username: process.env.DB_PG_USERNAME,
            //    password: process.env.DB_PG_PASSWORD,
            //    database: process.env.DB_PG_DB_NAME,
            //    ssl: true,
            //    "rejectUnauthorized": false,
            //    synchronize: process.env.NODE_ENV !== 'production',
            //    logging: true,
            //    schema : "public",
            //    entities: [
            //       __dirname + `/models/typeorm/INv2/*{.js,.ts}`
            //    ],
            //    migrations: [
            //       __dirname + `/migrations/typeorm/INv2/*.ts`
            //    ]
            // }
        },
    },
};
module.exports = Config;
