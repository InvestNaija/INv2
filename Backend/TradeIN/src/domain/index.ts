/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sequelize } from "sequelize-typescript";

const env = process.env.NODE_ENV || 'development';
import Config from "./config";

console.log(`Environment: ${env}`);
const config: { [key: string]: any; } = Config;
const databases = Object.keys(config[env].databases);
const cxn: { [key: string]: any; } = {};

export async function setup() {
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
                logging: (env !== 'production' ? true : false),
            });
            if (env !== 'production') {
                await cxn[database].sync({ alter: true });
            };
            cxn[database].authenticate()
                .then(() => console.log(`${database} connected....`))
                .catch((err: any) => {
                    console.log(`Error connecting to ${database}...${err.message}`);
                });
        }
    }
};

export function getDbCxn(type: string = 'pgINv2') {
    return cxn[type];
}
