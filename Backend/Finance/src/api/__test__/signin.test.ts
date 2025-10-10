import request from "supertest";
import { app } from "../../app";
import { rabbitmqWrapper } from "../../rabbitmq.wrapper";
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
      .post('/api/v2/auth/user/signin')
      .send({
         email: "ahassan@investinltd.com",
         password: "39d6e4ccb0a21368d0480006a38e6fda.4574366ed7055bdab2a45a4e19eabe22"
      })
      .expect(200);
   // expect( redisWrapper.client.setEx).toHaveBeenCalled();
   expect(rabbitmqWrapper.connection.createChannel).toHaveBeenCalled();
}, 20000);