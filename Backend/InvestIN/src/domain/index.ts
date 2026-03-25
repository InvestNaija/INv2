/* eslint-disable @typescript-eslint/no-explicit-any */

import { Sequelize } from 'sequelize-typescript';
import { Asset } from './sequelize/models/asset.model';
import { AssetTransaction } from './sequelize/models/transaction.model';
// import { DataSource } from 'typeorm';

const env = process.env.NODE_ENV || 'development';
import Config from './config';

console.log(`Environment: ${env}`);
const config: { [key: string]: any } = Config;
const databases = Object.keys(config[env].databases);
const cxn: any = {};

/**
 * setup
 * Initializes all database connections (Sequelize and TypeORM) as defined in the configuration.
 * Exact replica of the setup logic in SavePlan.
 */
export async function setup(): Promise<void> {
   for (const database of databases) {
      const dbPath = config[env].databases[database];

      if (dbPath['models']) {
         /**
          * Sequelize
          */
         cxn[database] = new Sequelize({
            ...dbPath,
            sync: { alter: true },
            modelMatch: (filename, member) => {
               const replaced = filename.replace(/-/g, '');
               return replaced.substring(0, replaced.indexOf('.model')) === member.toLowerCase();
            },
            logging: env !== 'production' ? true : false,
            models: [Asset, AssetTransaction], // Added Asset and AssetTransaction models
         });

         if (env !== 'production') {
            console.log(dbPath);
            await cxn[database].sync({ alter: true });
         }

         cxn[database]
            .authenticate()
            .then(() => console.log(`${database} connected....`))
            .catch((err: any) => {
               console.log(`Error connecting to ${database}...${err.message}`);
            });
      } else if (dbPath['entities']) {
         /**
          * TypeORM
          */
         // cxn[database] = new DataSource({
         //    ...dbPath,
         //    logging: env !== 'production',
         //    synchronize: false,
         // });
         // cxn[database]
         //    .initialize()
         //    .then(() => {
         //       console.log(`${database} connected...`);
         //    })
         //    .catch((err: any) => {
         //       console.error(`Error connecting to ${database} =>`, err.message);
         //    });
      }
   }
}

/**
 * getDbCxn
 * Returns the database connection for a specific key (defaulting to pgINv2).
 */
export function getDbCxn(type: string = 'pgINv2') {
   return cxn[type];
}
