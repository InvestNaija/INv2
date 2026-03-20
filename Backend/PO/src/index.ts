import { Application } from 'express';
import http from 'http';
import { app } from './app';
// Initiate DB connection here
import { setup } from './domain';

import { INLogger } from '@inv2/common';
import { rabbitmqWrapper } from './rabbitmq.wrapper';
import { redisWrapper } from './redis.wrapper';

const PORT = process.env.PORT || 3000;

export class Main {
   constructor(private app: Application) { }
   public start(): void {
      this.init(this.app);
   }
   /*=============================================
   =            Server setup            =
   =============================================*/
   private async init(app: Application): Promise<void> {
      try {
         await setup(); // Initialize the database connection
         const httpServer: http.Server = new http.Server(app);
         await this.createEventBus();
         this.startHttpServer(httpServer);
      } catch (error) {
         console.log(error);
      }
   }
   private async createEventBus(): Promise<void> {
      
      await redisWrapper.connect(`redis://${process.env.REDIS_SERVER}`);
      await rabbitmqWrapper.connect(`amqp://${process.env.RABBITMQ}`);

      INLogger.init('PO', rabbitmqWrapper.connection);
      
      rabbitmqWrapper.connection.on('close', ()=>{
         console.log(`RabbitMQ connection closed!`);
         process.exit();
      });
      process.on('SIGINT', async ()=> await rabbitmqWrapper.connection.close());
      process.on('SIGTERM', async ()=> await rabbitmqWrapper.connection.close());
   }
   private async startHttpServer(httpServer: http.Server): Promise<void> {
      httpServer.listen(PORT, () => {
         INLogger.log.info(`Server running on port ${PORT}`);
      });
   }
}

const myApp: Main = new Main(app);
myApp.start();
