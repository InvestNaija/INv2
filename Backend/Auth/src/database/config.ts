import dotenv from 'dotenv';
dotenv.config();
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
            "models": [__dirname + `/sequelize/INv2/models`],
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
};

export = Config;