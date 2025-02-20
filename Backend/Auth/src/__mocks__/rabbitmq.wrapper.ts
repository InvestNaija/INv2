/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

export const rabbitmqWrapper = {
   connect: jest.fn().mockImplementation(()=>this),
   connection: {
      createChannel: jest.fn().mockImplementation(()=>{
         return {
            assertExchange: jest.fn().mockImplementation(),
            publish: jest.fn().mockImplementation((exchangeName, subject, message)=>true)
         };
      }),
   }
};