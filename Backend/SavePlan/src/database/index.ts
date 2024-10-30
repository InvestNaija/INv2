/* eslint-disable @typescript-eslint/no-explicit-any */
// CREATE SCHEMA public;
// GRANT ALL ON SCHEMA public TO public;

import { Sequelize } from "sequelize-typescript";
// import { DataSource } from "typeorm";

const env = process.env.NODE_ENV || 'development';
import Config from "./config";

console.log(`Environment: ${env}`);
const config: { [key: string]: any;} = Config;
const databases = Object.keys(config[env].databases);
const cxn: { [key: string]: any;} = {};

const load = async()=>{
   for(const database of databases) {
      /**
       * Sequelize
       */
      const dbPath = config[env].databases[database];
      cxn[database] = new Sequelize({
         ...dbPath,
         sync: { alter: true },
         // logging: false,
      });
      if(env !== 'production') {
         console.log(dbPath);
         await cxn[database].sync({ alter: true });
      };
      cxn[database].authenticate()
         .then(() => console.log(`${database} connected....`))
         .catch((err: any) => {
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
};
load();

export = cxn;