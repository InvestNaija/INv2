
// We could also use rate-limiter-flexible
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { RedisClientType } from 'redis';

async function start(client: RedisClientType) {
      
   // Create a `node-redis` client
   // const client = createClient({
   //    // ... (see https://github.com/redis/node-redis/blob/master/docs/client-configuration.md)
   //    socket: {
   //       reconnectStrategy: retries => Math.min(retries * 50, 1000)
   //    }
   // });
   // // Then connect to the Redis server
   // await client.connect();

   // Create and use the rate limiter
   return rateLimit({
      // Rate limiter configuration
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers

      // Redis store configuration
      store: new RedisStore({
         sendCommand: (...args: string[]) => client.sendCommand(args),
      }),
   })
}
// const limiter = start()
// export { limiter };