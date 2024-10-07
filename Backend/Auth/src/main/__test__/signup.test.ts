import request from "supertest";
import { app } from "../../app";
import { rabbitmqWrapper } from "../../rabbitmq.wrapper";
it(`Returns 400 if required params are not supplied`, async ()=>{
   await request(app)
      .post('/api/v2/auth/user/signup')
      .send({
         firstName: "Abimbs",
         lastName: "Hans",
         phone: "1031314139",
         password: "ecdb16de9e22e30877d96820140b0e91.89714cc2ad55373c717b53b4625a712b"
      })
      .expect(400);
   await request(app)
      .post('/api/v2/auth/user/signup')
      .send({
         "firstName": "Abimbs",
         "lastName": "Hans",
         "email": "a@b.com",
         "phone": "1031314140",
      })
      .expect(400);
}, 20000);
it(`Returns 201 on successful signup`, async ()=>{
   await request(app)
      .post('/api/v2/auth/user/signup')
      .send({
         "firstName": "Abimbs",
         "lastName": "Hans",
         "phone": "1031314141",
         "email": "a@b.com",
         "password": "ecdb16de9e22e30877d96820140b0e91.89714cc2ad55373c717b53b4625a712b"
      })
      .expect(200);

   expect((await rabbitmqWrapper.connection.createChannel()).publish).toHaveBeenCalled();
}, 20000);