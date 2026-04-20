import amqplib, { Connection } from 'amqplib';
import { Exception } from '@inv2/common';

/**
 * RabbitmqWrapper
 * Manages the connection to the RabbitMQ message broker.
 */
class RabbitmqWrapper {
   private cxn!: Connection;

   /**
    * Connects to the RabbitMQ server.
    * @param url The AMQP connection URL.
    */
   async connect(url: string): Promise<void> {
      console.log(`Trying to connect to rabbitMQ`, url);
      this.cxn = await amqplib.connect(url, { timeout: 10000 }) as unknown as Connection;
      console.log(`Connected to rabbitMQ`);
   }

   /**
    * Returns the active RabbitMQ connection.
    * Throws an exception if the connection has not been established.
    */
   get connection() {
      if (!this.cxn) throw new Exception({ code: 500, message: 'Connect to RabbitMQ before getting connection' });
      return this.cxn;
   }
}

export const rabbitmqWrapper = new RabbitmqWrapper();
