/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

export const redisWrapper = {
   connect: jest.fn().mockImplementation(()=>this),
   client: {
      setEx: jest.fn().mockImplementation(),
      get: jest.fn().mockImplementation(),
      del: jest.fn().mockImplementation(),
   }
};