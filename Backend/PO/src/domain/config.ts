import dotenv from 'dotenv';
dotenv.config();
import * as path from 'path';
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
            "models": [path.resolve(__dirname + `/sequelize/`) +'/**/*.entity{.ts,.js}'],
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

export = Config;