/* eslint-disable @typescript-eslint/no-explicit-any */

// import * from 'auth.setup'
// import fs from "fs";
import { Sequelize } from "sequelize-typescript";
import { up } from "../database/sequelize/INv2/seeders/seed-all-data";

// declare global {
//    var getAuthCookie: () => string[];
// }

jest.mock('../rabbitmq.wrapper');
let sequelize: Sequelize;
beforeAll(async ()=>{
   jest.clearAllMocks();   
   // process.env.ACCESS_TOKEN_SECRET = '2NjQ5fQ.BpnmhQBqzLfYf';
   // process.env.NODE_ENV = 'test'
   
   sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      models: [__path.join(__dirname, `../database/sequelize/INv2/models`)]
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
   jest.clearAllMocks();
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


// global.getAuthCookie = ()=> {
//    // // Build a jwt payload {id, email}
//    // const payload = {
//    //    id: new mongoose.Types.ObjectId().toHexString(),
//    //    email: "a@b.com"
//    // };
//    // // create a JWT
//    // const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!);
//    // // Build session Object. {jwt: MY_JWT}
//    // const session = { jwt: token };
//    // // Turn that session into JSON
//    // const sessionJSON = JSON.stringify(session);
//    // // Take JSON and encode it as base64
//    // const base64 = Buffer.from(sessionJSON).toString('base64');
//    // // return a string that's the cookie with the encoded data
//    // return [`session=${base64}`];
// }