import dotenv from 'dotenv';
dotenv.config();
import * as path from 'path';

/**
 * Database Configuration
 * Maps environment variables to database specific settings for Sequelize and TypeORM.
 * Follows the SavePlan microservice template structure.
 */
const Config = {
   postgres: {
      host: process.env.DB_PG_HOST,
      database: process.env.DB_PG_DB_NAME,
      username: process.env.DB_PG_USERNAME,
      password: process.env.DB_PG_PASSWORD,
      port: process.env.DB_PG_PORT,
      timezone: process.env.DB_PG_TIMEZONE,
      dialect: 'postgres',
      ssl: true,
      rejectUnauthorized: false,
      dialectOptions: {
         ssl: {
            require: true,
            rejectUnauthorized: false,
         },
      },
   },
   development: {
      databases: {
         /** Sequelize for InvestIN */
         pgINv2: {
            host: process.env.DB_PG_HOST,
            database: process.env.DB_PG_DB_NAME,
            username: process.env.DB_PG_USERNAME,
            password: process.env.DB_PG_PASSWORD,
            port: process.env.DB_PG_PORT,
            timezone: process.env.DB_PG_TIMEZONE,
            models: [__dirname + '/sequelize/models/*.model.ts'],
            dialect: 'postgres',
            ssl: true,
            rejectUnauthorized: false,
            dialectOptions: {
               ssl: {
                  require: true,
                  rejectUnauthorized: false,
               },
            },
         },
      },
   },
   staging: {
      databases: {
         pgINv2: {
            host: process.env.DB_PG_HOST,
            database: process.env.DB_PG_DB_NAME,
            username: process.env.DB_PG_USERNAME,
            password: process.env.DB_PG_PASSWORD,
            port: process.env.DB_PG_PORT,
            dialect: 'postgres',
            timezone: process.env.DB_PG_TIMEZONE,
            models: [__dirname + '/sequelize/models'],
            ssl: true,
            rejectUnauthorized: false,
            dialectOptions: {
               ssl: {
                  require: true,
                  rejectUnauthorized: false,
               },
            },
         },
      },
   },
   production: {
      databases: {
         pgINv2: {
            host: process.env.DB_PG_HOST,
            database: process.env.DB_PG_DB_NAME,
            username: process.env.DB_PG_USERNAME,
            password: process.env.DB_PG_PASSWORD,
            port: process.env.DB_PG_PORT,
            timezone: process.env.DB_PG_TIMEZONE,
            dialect: 'postgres',
            models: [path.resolve(__dirname + '/sequelize/') + '/**/*.entity{.ts,.js}'],
            ssl: true,
            rejectUnauthorized: false,
            dialectOptions: {
               ssl: {
                  require: true,
                  rejectUnauthorized: false,
               },
            },
         },
      },
   },
};

export = Config;
