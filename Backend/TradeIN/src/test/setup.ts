import path from "path";
import crypto from "crypto";
import { Sequelize } from "sequelize-typescript";
import { up, users } from "../domain/sequelize/INv2/seeders/seed-all-data";
import { JWTService, INLogger } from "@inv2/common";

declare global {
   // eslint-disable-next-line no-unused-vars, no-var
   var getJWTAuth: (role?: string) => string;
}

jest.mock('../rabbitmq.wrapper');
// jest.mock('../redis.wrapper');
import { rabbitmqWrapper } from "../rabbitmq.wrapper";

// Generate ACCESS_TOKEN_SECRET if not already set
if (!process.env.ACCESS_TOKEN_SECRET) {
   process.env.ACCESS_TOKEN_SECRET = crypto.randomBytes(32).toString('hex');
}

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
process.env.ACTIVE_TRADE_PROVIDER = 'ZANIBAL';
process.env.ZANIBAL_APPSERVER_BASE_URL = 'https://api-chd-test.zanibal.com/api/v1';
process.env.ZANIBAL_MDS_BASE_URL = 'https://mds-chd-prod.zanibal.com';
process.env.ZANNIBAL_USER = 'investnaija';
process.env.ZANNIBAL_PASSWORD = 'Invest9ja$1221';

let sequelize: Sequelize;
beforeAll(async () => {
   jest.clearAllMocks();

   // Mock rabbitmqWrapper.connection so INLogger.init() doesn't fail
   const mockChannel = {
      assertExchange: jest.fn().mockResolvedValue({}),
      publish: jest.fn().mockReturnValue(true),
      consume: jest.fn(),
      ack: jest.fn(),
      nack: jest.fn(),
      assertQueue: jest.fn().mockResolvedValue({ queue: 'test-queue' }),
      bindQueue: jest.fn().mockResolvedValue({}),
      prefetch: jest.fn(),
   };
   const mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      on: jest.fn(),
      close: jest.fn(),
   };
   Object.defineProperty(rabbitmqWrapper, 'connection', {
      get: jest.fn().mockReturnValue(mockConnection),
      configurable: true,
   });

   INLogger.init('TradeIN', rabbitmqWrapper.connection as any);

   sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      models: [path.join(__dirname, `../domain/sequelize/INv2/models`)],
      modelMatch: (filename, member) => {
         const replaced = filename.replace(/-/g, '');
         return replaced.substring(0, replaced.indexOf('.model')) === member.toLowerCase();
      },
   });
   await sequelize.sync({ force: true });
   await sequelize.authenticate()
      .then(() => console.log(`Database connected....`))
      .catch((err: any) => {
         console.log(`Error connecting to Database...${err.message}`);
      });
   await up(sequelize.getQueryInterface());
});

global.getJWTAuth = (role?: string) => {
   // Build a jwt payload {id, email}
   let user = null;
   if (role) user = users.find(user => user.tenant_roles.includes(role));
   else user = users[Math.floor(Math.random() * (users.length - 1 + 0) + 0)];
   if (!user) return null as any;

   const payload = {
      user: JSON.parse(user?.details || '{user:{}}').user,
      Tenant: JSON.parse(user?.tenant_roles || '{Tenant:{}}').Tenant,
   };
   // create a JWT
   const token = JWTService.createJWTToken(payload, process.env.ACCESS_TOKEN_SECRET!, "1h");
   return token.data;
};