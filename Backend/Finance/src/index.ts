import { Application } from 'express';
import http from 'http';
// Initiate DB connection here
import { setup } from './domain';

import { app } from './app';
import { INLogger } from '@inv2/common';
import { rabbitmqWrapper } from './rabbitmq.wrapper';
import { redisWrapper } from './redis.wrapper';
import { UserCreatedListener, UserUpdatedListener } from "./events/listeners";
import { socketIO } from './socketio';
import { GrpcServer } from './grpc/server';
import { container } from './inversify.config';
import { TYPES } from './business/types';
const PORT: number = parseInt(process.env.PORT) || 3000;

export class Main {
   private grpcServer: GrpcServer;
   constructor(private app: Application) { 
      this.grpcServer = container.get<GrpcServer>(TYPES.GrpcServer);
   }
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
         // await this.createSocketIO(httpServer);
         await this.createEventBus();
         await this.startGrpc();
         this.startHttpServer(httpServer);
         // this.socketIOConnections(socketIO);
      } catch (error) {
         console.log(error);
      }
   }
   private async createSocketIO(server: http.Server) {
      await socketIO.connect(server);
   }
   private async createEventBus(): Promise<void> {
      
      await redisWrapper.connect(`redis://${process.env.REDIS_SERVER}`);
      await rabbitmqWrapper.connect(`amqp://${process.env.RABBITMQ}`);

      INLogger.init('Finance', rabbitmqWrapper.connection);
      
      rabbitmqWrapper.connection.on('close', ()=>{
         console.log(`RabbitMQ connection closed!`);
         process.exit();
      });
      process.on('SIGINT', async ()=> await rabbitmqWrapper.connection.close());
      process.on('SIGTERM', async ()=> await rabbitmqWrapper.connection.close());

      // Set up all listeners
      new UserCreatedListener(rabbitmqWrapper.connection).listen();
      new UserUpdatedListener(rabbitmqWrapper.connection).listen();
   }
   private async startHttpServer(httpServer: http.Server): Promise<void> {
      httpServer.listen(PORT, () => {
         INLogger.log.info(`Server running on port ${PORT}`);
      });
   }
   
   private async startGrpc(): Promise<void> {
      try {
         await this.grpcServer.start(PORT);
         
         // Handle graceful shutdown
         process.on('SIGINT', async () => await this.grpcServer.stop() );
         process.on('SIGTERM', async () => await this.grpcServer.stop());
      } catch (error) {
         INLogger.log.error('Failed to start gRPC server:', error);
         throw error;
      }
   }
}

const myApp: Main = new Main(app);
myApp.start();
