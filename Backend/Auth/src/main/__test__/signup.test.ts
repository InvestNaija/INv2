import request from "supertest";
import { app } from "../../app";
import { rabbitmqWrapper } from "../../rabbitmq.wrapper";
it(`Returns 400 if required params are not supplied`, async ()=>{
   await request(app)
      .post('/api/v2/auth/user/signup')
      .send({
         firstName: "Abimbs",
         lastName: "Hans",
         phone: "yygiyggy23",
         password: "W8SNi8zxlU5FHmgLr9hN0A=="
      })
      .expect(400);
   await request(app)
      .post('/api/v2/auth/user/signup')
      .send({
         "firstName": "Abimbs",
         "lastName": "Hans",
         "email": "a@b.com",
         "phone": "yygiyggy23",
      })
      .expect(400);
}, 20000);
it(`Returns 201 on successful signup`, async ()=>{
   await request(app)
      .post('/api/v2/auth/user/signup')
      .send({
         "firstName": "Abimbs",
         "lastName": "Hans",
         "phone": "yygiyggy23",
         "email": "a@b.com",
         "password": "W8SNi8zxlU5FHmgLr9hN0A=="
      })
      .expect(200);

   expect((await rabbitmqWrapper.connection.createChannel()).publish).toHaveBeenCalled();
}, 20000);