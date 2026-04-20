import { Application } from 'express';
import http from 'http';
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

// Global error handlers
process.on('uncaughtException', (error) => {
   if (INLogger.log) {
      INLogger.log.error('Uncaught Exception:', error);
   } else {
      console.error('Uncaught Exception (Logger not init):', error);
   }
   process.exit(1);
});

process.on('unhandledRejection', (reason) => {
   if (INLogger.log) {
      INLogger.log.error('Unhandled Rejection:', reason);
   } else {
      console.error('Unhandled Rejection (Logger not init):', reason);
   }
   process.exit(1);
});

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
         INLogger.log.error('Initialization failed:', error);
         process.exit(1);
      }
   }
   private async createSocketIO(server: http.Server) {
      await socketIO.connect(server);
   }
   private async createEventBus(): Promise<void> {
      
      await redisWrapper.connect(`redis://${process.env.REDIS_SERVER}`);
      await rabbitmqWrapper.connect(`amqp://${process.env.RABBITMQ}`);

      INLogger.init('Finance', rabbitmqWrapper.connection);
      
      (rabbitmqWrapper.connection as any).on('close', ()=>{
         console.log(`RabbitMQ connection closed!`);
         process.exit(1);
      });
      process.on('SIGINT', async ()=> await (rabbitmqWrapper.connection as any).close());
      process.on('SIGTERM', async ()=> await (rabbitmqWrapper.connection as any).close());

      // Set up all listeners
      new UserCreatedListener(rabbitmqWrapper.connection).listen();
      new UserUpdatedListener(rabbitmqWrapper.connection).listen();
   }
   private async startHttpServer(httpServer: http.Server): Promise<void> {
      const PORT: number = parseInt(process.env.PORT) || 3000;
      httpServer.listen(PORT, () => {
         INLogger.log.info(`Server running on port ${PORT}`);
      });
   }
   
   private async startGrpc(): Promise<void> {
      const PORT: number = parseInt(process.env.PORT) || 3000;
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

// Only start the app if not in test environment
if (process.env.NODE_ENV !== 'test') {
   const myApp: Main = new Main(app);
   myApp.start();
}
