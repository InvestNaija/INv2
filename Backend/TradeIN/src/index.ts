import { Application } from 'express';
import http from 'http';
import { app } from './app';
// Initiate DB connection here
import { setup } from "./domain";

import { INLogger } from '@inv2/common';
import { rabbitmqWrapper } from './rabbitmq.wrapper';
import { redisWrapper } from './redis.wrapper';
import { UserCreatedListener, UserUpdatedListener } from "./events/listeners";
const PORT = process.env.PORT || 3000;

export class Main {
   // eslint-disable-next-line no-unused-vars
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

      // @ts-ignore
      INLogger.init('TradeIN', rabbitmqWrapper.connection);

      rabbitmqWrapper.connection.on('close', () => {
         console.log(`RabbitMQ connection closed!`);
         process.exit();
      });
      process.on('SIGINT', async () => await rabbitmqWrapper.connection.close());
      process.on('SIGTERM', async () => await rabbitmqWrapper.connection.close());

      // Set up all listeners
      // @ts-ignore
      new UserCreatedListener(rabbitmqWrapper.connection).listen();
      // @ts-ignore
      new UserUpdatedListener(rabbitmqWrapper.connection).listen();
   }
   private async startHttpServer(httpServer: http.Server): Promise<void> {
      httpServer.listen(PORT, () => {
         INLogger.log.info(`Server running on port ${PORT}`);
      });
   }
}

const myApp: Main = new Main(app);
myApp.start();
