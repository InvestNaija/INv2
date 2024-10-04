import amqplib, { Channel, Connection, Message } from "amqplib";
import { Subjects } from "../subjects";

interface Event {
   subject: Subjects;
   data: any;
}

export abstract class Listener<T extends Event> {
   abstract subject: T['subject']; // Name of the routingKey to listen on
   abstract queueName: string; // Name of the group the listener will join/listen on
   abstract onMessage(data: T['data'], channel: Channel, msg: Message): void;
   protected ackWait = 5 * 1000 // 5 seconds

   constructor(private connection: Connection, protected exchangeName='INv2', protected exchangeType='direct') { } //client is the pre-initialized NATS client

   async listen() {
      const channel = await this.connection.createChannel();
      await channel.assertExchange(this.exchangeName, this.exchangeType, { durable: true });
      const q = await channel.assertQueue(this.queueName, { durable: true });
      channel.prefetch(1);
      await channel.bindQueue(q.queue, this.exchangeName, this.subject);

      channel.consume(q.queue, msg => {
         console.log(`Message reveived: ${this.queueName}/${this.subject}`);

         const parsedData = this.parseMessage(msg as Message);
         this.onMessage(parsedData, channel, msg as Message)
      }, { noAck: false });
   }

   parseMessage(msg: Message) {
      const data = msg ? msg.content: '';
      return typeof data ==='string' ? JSON.parse(data) : JSON.parse(data.toString('utf8'))
   }
}