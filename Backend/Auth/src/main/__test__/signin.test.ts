import request from "supertest";
import { app } from "../../app";
// import { rabbitmqWrapper } from "../../rabbitmq.wrapper";
// import { redisWrapper } from "../../redis.wrapper";
// it(`Returns 400 if required params are not supplied`, async ()=>{
//    // await request(app)
//    //    .post('/api/v2/auth/user/signin')
//    //    .send({
//    //       email: "infinitizon@gmail.co",
//    //       password: "ecdb16de9e22e30877d96820140b0e91.89714cc2ad55373c717b53b4625a712b"
//    //    })
//    //    .expect(400);
//    // await request(app)
//    //    .post('/api/v2/auth/user/signin')
//    //    .send({
//    //       email: "infinitizon@gmail.com",
//    //    }) 
//    //    .expect(401);
// }, 20000);
it(`Returns 201 on successful signin`, async ()=>{
   await request(app)
      .post('/api/v2/auth/user/signup')
      .send({
         "firstName": "Abimbs",
         "lastName": "Hans",
         "phone": "1031314141",
         "email": "a@b.com",
         "password": "ecdb16de9e22e30877d96820140b0e91.89714cc2ad55373c717b53b4625a712b"
      })
      .expect(201);
   await request(app)
      .post('/api/v2/auth/user/signin')
      .send({
<<<<<<< HEAD
         email: "infinitizon@gmail.com",
=======
         email: "ahassan@investinltd.com",
>>>>>>> staging
         password: "ecdb16de9e22e30877d96820140b0e91.89714cc2ad55373c717b53b4625a712b"
      })
      .expect(200);
   // expect( redisWrapper.client.setEx).toHaveBeenCalled();
   // expect(rabbitmqWrapper.connection.createChannel).toHaveBeenCalled();
}, 20000);