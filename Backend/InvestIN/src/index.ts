import { Application } from 'express';
import http from 'http';
import { app } from './app';
import { setup } from './domain';
import { INLogger } from '@inv2/common';
import { rabbitmqWrapper } from './rabbitmq.wrapper';
import { redisWrapper } from './redis.wrapper';
import { GrpcClient } from './grpc/client';
import { container } from './inversify.config';
import { TYPES } from './business/types';
import { IHolidayRepository } from './domain/sequelize/repositories/holiday.repository';
import { HolidayCreatedListener, HolidayUpdatedListener, HolidayDeletedListener } from './events/listeners';

const PORT: number = parseInt(process.env.PORT!) || 3000;

/**
 * Main
 * Orchestrates the startup of all microservice components including
 * database, event bus, and servers.
 */
export class Main {
   private grpcClient: GrpcClient;

   constructor(private app: Application) {
      this.grpcClient = new GrpcClient();
   }

   /**
    * Starts the application initialization sequence.
    */
   public start(): void {
      this.init(this.app);
   }

   /**
    * Core initialization logic.
    * @param app The Express application instance.
    */
   private async init(app: Application): Promise<void> {
      try {
         await setup(); // Initialize the database connection
         const httpServer: http.Server = new http.Server(app);
         // await this.createSocketIO(httpServer);
         await this.createEventBus();
         await this.startGrpc();
         this.startHttpServer(httpServer);
      } catch (error) {
         console.error('Initialization failure:', error);
         process.exit(1);
      }
   }

   /**
    * Configures connections to RabbitMQ and Redis, and initializes logging.
    */
   private async createEventBus(): Promise<void> {
      try {
         await redisWrapper.connect(`redis://${process.env.REDIS_SERVER || 'localhost:6379'}`);
         await rabbitmqWrapper.connect(`amqp://${process.env.RABBITMQ || 'localhost'}`);

         // Initialize the project-wide logger with the rabbitmq connection
         INLogger.init('InvestIN', rabbitmqWrapper.connection);

         // Initialize Listeners
         const holidayRepo = container.get<IHolidayRepository>(TYPES.HolidayRepository);
         new HolidayCreatedListener(rabbitmqWrapper.connection, holidayRepo).listen();
         new HolidayUpdatedListener(rabbitmqWrapper.connection, holidayRepo).listen();
         new HolidayDeletedListener(rabbitmqWrapper.connection, holidayRepo).listen();

         rabbitmqWrapper.connection.on('close', () => {
            console.warn('RabbitMQ connection closed!');
            process.exit(1);
         });

         // Graceful shutdown listeners
         process.on('SIGINT', async () => await (rabbitmqWrapper.connection as any).close());
         process.on('SIGTERM', async () => await (rabbitmqWrapper.connection as any).close());
      } catch (error) {
         console.error('Event bus initialization failed:', error);
         throw error;
      }
   }

   /**
    * Starts the Express HTTP server.
    * @param httpServer The HTTP server instance.
    */
   private async startHttpServer(httpServer: http.Server): Promise<void> {
      httpServer.listen(PORT, () => {
         INLogger.log.info(`InvestIN service running on port ${PORT}`);
      });
   }

   /**
    * Prepares the gRPC client (Placeholder for complex startup sequences).
    */
   private async startGrpc(): Promise<void> {
      try {
         // gRPC client is started on-demand in services, but can be pre-warmed here
         INLogger.log.info('gRPC Client support initialized');
      } catch (error) {
         INLogger.log.error('Failed to initialize gRPC client:', error);
         throw error;
      }
   }
}

// Bootstrap the application
const myApp: Main = new Main(app);
myApp.start();
