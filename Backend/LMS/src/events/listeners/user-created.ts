import { Listener, Subjects, UserCreatedEvent } from "@inv2/common";
import { Channel, Message } from "amqplib";
import { User, } from "../../domain/sequelize/INv2";

export class UserCreatedListener extends Listener<UserCreatedEvent> {
   readonly subject = Subjects.UserCreated; 
   queueName = 'auth-service';
   async onMessage(data: UserCreatedEvent['data'], channel: Channel, msg: Message): Promise<void> {
      try {
         console.log('======> LMS received user created with id: ', data.user!.id);
         
         // Check if user already exists
         const existingUser = await User.findOne({ where: { id: data.user!.id } });
         
         if (existingUser) {
            console.log('User already exists in LMS, skipping creation');
            channel.ack(msg);
            return;
         }
         
         await User.create({
            id: data.user!.id,
            pId: data.user!.pId,
            details: data.user,
            // version: data.user.version,
            tenantRoles: [{...data.tenant, roles: [data.role]}]
         });
         
         console.log('User created successfully in LMS');
         channel.ack(msg);
      } catch (error) {
         console.error('Error creating user in LMS:', error);
         // Acknowledge the message to prevent infinite retries
         channel.ack(msg);
      }
   }
}