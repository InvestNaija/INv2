import { Exception } from "@inv2/common";
import amqplib, { Connection } from "amqplib";

class RabbitmqWrapper {
   private cxn!: Connection;
   async connect(url: string): Promise<void> {
      console.log(`Trying to connect to rabbitMQ`);
      this.cxn = await amqplib.connect(url, { timeout: 10000,  });
      console.log(`Connected to rabbitMQ`);
   }
   get connection() {
      if(!this.cxn) throw new Exception({code: 500, message: 'Connect to RabbitMQ before getting connection'});
      return this.cxn;
   }
}

export const rabbitmqWrapper = new RabbitmqWrapper;