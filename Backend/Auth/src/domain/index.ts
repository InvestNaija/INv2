/* eslint-disable @typescript-eslint/no-explicit-any */
// CREATE SCHEMA public;
// GRANT ALL ON SCHEMA public TO public;

import { Sequelize } from "sequelize-typescript";
import { DataSource } from "typeorm";
import { INv2Models } from "./sequelize/INv2";

const env = process.env.NODE_ENV || 'development';
import Config from "./config";

let config: any = Config;
if (config.default) {
   config = config.default;
}

const cxn: { [key: string]: any; } = {};

export async function setup() {
   const currentConfig = config[env];
   if (!currentConfig || !currentConfig.databases) {
      console.error(`No database configuration found for environment: ${env}`);
      return;
   }

   const databases = Object.keys(currentConfig.databases);

   for (const database of databases) {
      const dbPath = currentConfig.databases[database];

      if (dbPath['models']) {
         if (typeof (Reflect as any).getMetadata !== 'function') {
            throw new Error('Reflect.getMetadata is not a function. Ensure "reflect-metadata" is imported at the very top of your entry point.');
         }

         /**
          * Sequelize
          */
         const sequelizeOptions: any = {
            ...dbPath,
            sync: { alter: env !== 'test', force: env === 'test' },
            logging: (env !== 'production' && env !== 'test' ? true : false),
            repositoryMode: false,
         };

         // Use explicit models array for INv2 to avoid circular dependency / metadata issues
         if (database === 'pgINv2') {
            sequelizeOptions.models = INv2Models;
            // Remove modelPaths/modelMatch if they exist as we are using explicit registration
            delete sequelizeOptions.modelPaths;
         }

         cxn[database] = new Sequelize(sequelizeOptions);

         if (env === 'test') {
            await cxn[database].sync({ force: true });
         } else if (env === 'development') {
            await cxn[database].sync({ alter: true });
         }

         cxn[database].authenticate()
            .then(() => { if (env !== 'test') console.log(`${database} connected....`); })
            .catch((err: any) => {
               console.error(`Error connecting to ${database}...${err.message}`);
            });
      } else if (dbPath['entities']) {
         /**
          * TypeORM
          */
         cxn[database] = new DataSource({
            ...dbPath,
            logging: env !== 'test',
            synchronize: false,
         });
         cxn[database].initialize()
            .then(() => {
               if (env !== 'test') console.log(`${database} connected...`);
            })
            .catch((err: any) => {
               console.error(`Error connecting to ${database} =>`, err.message);
            });
      }
   }
};
export function getDbCxn(type: string = 'pgINv2') {
   return cxn[type];
}