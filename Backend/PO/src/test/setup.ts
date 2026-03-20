/* eslint-disable @typescript-eslint/no-explicit-any */

import path from "path";
import { Sequelize } from "sequelize-typescript";
import { Offering } from "../domain/sequelize/INv2/models/offering.model";
import { Order } from "../domain/sequelize/INv2/models/order.model";
import { up, users } from "../domain/sequelize/INv2/seeders/seed-all-data";
import { JWTService } from "@inv2/common";

declare global {
   // eslint-disable-next-line no-unused-vars, no-var
   var getJWTAuth: (role?: string) => string;
}

jest.mock('../rabbitmq.wrapper', () => {
   return {
      rabbitmqWrapper: {
         connection: {
            createChannel: jest.fn().mockResolvedValue({
               assertExchange: jest.fn().mockResolvedValue(true),
               publish: jest.fn().mockReturnValue(true)
            }),
            close: jest.fn(),
            on: jest.fn()
         }
      }
   };
});
jest.mock('../redis.wrapper');
import { INLogger } from '@inv2/common';
import { rabbitmqWrapper } from "../rabbitmq.wrapper";
let sequelize: Sequelize;
beforeAll(async ()=>{
   jest.clearAllMocks();
   jest.useFakeTimers();
   INLogger.init('PO', rabbitmqWrapper.connection);
   
   sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      models: [Offering, Order]
   });
   await sequelize.sync({ force: true });
   await sequelize.authenticate()
      .then(() => console.log(`PO Database connected....`))
      .catch((err: any) => {
         console.log(`Error connecting to Database...${err.message}`);
      });
   await up(sequelize.getQueryInterface());
});

beforeEach(async()=>{
});

afterAll(async () => {
   if (sequelize) {
      await sequelize.close();
   }
});

global.getJWTAuth = (role?: string)=> {
   let user = null;
   if(role) user = users.find(user=>user.tenant_roles.includes(role));
   else user = users[Math.floor(Math.random() * (users.length - 1 + 0) + 0)];
   if(!user) return null;

   const payload = {
      user: JSON.parse(user?.details||'{user:{}}').user,
      Tenant: JSON.parse(user?.tenant_roles||'{Tenant:{}}').Tenant,
   };
   const token = JWTService.createJWTToken(payload, process.env.ACCESS_TOKEN_SECRET!, "1h");
   return token.data;
};
