import { createClient, RedisClientType } from 'redis';
import { Exception } from '@inv2/common';

/**
 * RedisWrapper
 * Manages the connection to the Redis server for caching or shared state.
 */
class RedisWrapper {
   private cxn!: RedisClientType;

   /**
    * Connects to the Redis server.
    * @param url The Redis connection URL.
    */
   async connect(url: string): Promise<void> {
      console.log(`Trying to connect to Redis`, url);
      this.cxn = createClient({
         url,
         socket: {
            reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
         },
      });
      await this.cxn.connect();
      console.log(`Connected to Redis Server`);
   }

   /**
    * Returns the active Redis client.
    * Throws an exception if the connection has not been established.
    */
   get client() {
      if (!this.cxn) throw new Exception({ code: 500, message: 'Connect to Redis before getting connection' });
      return this.cxn;
   }
}

export const redisWrapper = new RedisWrapper();
