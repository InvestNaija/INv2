/* eslint-disable @typescript-eslint/no-explicit-any */

export const rabbitmqWrapper = {
   // const Args = {};
   connect: jest.fn().mockImplementation(()=>this),
   connection: {
      createChannel: jest.fn().mockImplementation(()=>this),
      assertExchange: jest.fn().mockImplementation((exchange: string, type: string, options: any) => {
         console.log(exchange, type, options);
         return this;
      }),
      publish: jest.fn().mockImplementation((exchange: string, routingKey: string, content: Buffer, options: any) => {
         console.log(exchange, routingKey, options);
         return true;
      })
   }
   // connection: {
   //    createChannel: jest.fn().mockImplementation((err, ch)=>{
   //       ch.assertExchange(ex, 'topic', exopts, function(err, ok) {
   //          ch.publish(ex, key, new Buffer(message));
   //          console.log(" [x] Sent %s:'%s'", key, message);
   //          ch.close(function() { conn.close(); });
   //       });
   //    }),
   //    assertExchange: jest.fn().mockImplementation((exchange: string, type: string, options: any) => {
   //       console.log(exchange, type, options);
   //       return this;
   //    }),
   //    publish: jest.fn().mockImplementation((exchange: string, routingKey: string, content: Buffer, options: any) => {
   //       console.log(exchange, routingKey, options);
   //       return true;
   //    })
   // }
};