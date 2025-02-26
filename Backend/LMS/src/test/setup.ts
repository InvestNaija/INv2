/* eslint-disable @typescript-eslint/no-explicit-any */

// import * from 'auth.setup'
import path from "path";
import { Sequelize } from "sequelize-typescript";
import { up, users } from "../database/sequelize/INv2/seeders/seed-all-data";
import { JWTService } from "@inv2/common";

declare global {
   // eslint-disable-next-line no-unused-vars, no-var
   var getJWTAuth: (role?: string) => string;
}

jest.mock('../rabbitmq.wrapper');
jest.mock('../redis.wrapper');
import { INLogger } from '@inv2/common';
import { rabbitmqWrapper } from "../rabbitmq.wrapper";
let sequelize: Sequelize;
beforeAll(async ()=>{
   jest.clearAllMocks();
   jest.useFakeTimers();
   // process.env.ACCESS_TOKEN_SECRET = '2NjQ5fQ.BpnmhQBqzLfYf';
   // process.env.NODE_ENV = 'test'
   INLogger.init('SavePlan', rabbitmqWrapper.connection);
   
   sequelize = new Sequelize({
      dialect: "sqlite",
      // storage: __dirname+"/test.sqlite",
      storage: ":memory:",
      logging: false,
      models: [path.join(__dirname, `../database/sequelize/INv2/models`)]
   });
   await sequelize.sync({ force: true });
   await sequelize.authenticate()
      .then(() => console.log(`Database connected....`))
      .catch((err: any) => {
         console.log(`Error connecting to Database...${err.message}`);
      });
   await up(sequelize.getQueryInterface());
});

beforeEach(async()=>{
   // const collections = await mongoose.connection.db.collections();
   // for (let collection of collections) {
   //    await collection.deleteMany({});
   // }
});

afterAll(async () => {
   // if (sequelize) {
   //    await sequelize.close();
   //    // fs.unlinkSync(__dirname+"/test.sqlite");
   // }
});


global.getJWTAuth = (role?: string)=> {
   // Build a jwt payload {id, email}
   let user = null;
   if(role) user = users.find(user=>user.tenant_roles.includes(role));
   else user = users[Math.floor(Math.random() * (users.length - 1 + 0) + 0)];
   if(!user) return null;

   const payload = {
      user: JSON.parse(user?.details||'{user:{}}').user,
      Tenant: JSON.parse(user?.tenant_roles||'{Tenant:{}}').Tenant,
   };
   // create a JWT
   const token = JWTService.createJWTToken(payload, process.env.ACCESS_TOKEN_SECRET!, "1h");
   return token.data;
};
