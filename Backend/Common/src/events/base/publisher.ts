import amqplib, { Connection } from "amqplib";
import { Subjects } from "../subjects";

interface Event {
   subject: Subjects;
   data: any;
}

export abstract class Publisher<T extends Event> {
   abstract subject: T['subject']; // Name of the channel to listen on

   constructor(protected connection: Connection, protected exchangeName='INv2', protected exchangeType='direct') { } //client is the pre-initialized NATS client

   publish(data: T['data']): Promise<void> {
      return new Promise(async (resolve, reject)=> {
         const channel = await this.connection.createChannel();
         await channel.assertExchange(this.exchangeName, this.exchangeType, { durable: true });
         
         const isPublished = channel.publish(this.exchangeName, this.subject, Buffer.from(JSON.stringify(data)), {deliveryMode: 2, persistent: true})
         if(!isPublished) return reject(`Error publishing to exchange`);
         
         console.log(`The message was sent to ${this.exchangeName} exchange at channel ${this.subject}`);
         resolve();
      })
   }
}