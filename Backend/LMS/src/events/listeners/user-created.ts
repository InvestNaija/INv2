import { Listener, Subjects, UserCreatedEvent } from "@inv2/common";
import { Channel, Message } from "amqplib";
import { User, } from "../../database/sequelize/INv2";

export class UserCreatedListener extends Listener<UserCreatedEvent> {
   readonly subject = Subjects.UserCreated; 
   queueName = 'auth-service';
   onMessage(data: UserCreatedEvent['data'], channel: Channel, msg: Message): void {
      console.log('======> LMS received user created with id: ', data.user?.id,);
      User.create({
         id: data.user?.id,
         pId: data.user?.pId,
         details: data?.user,
         // version: data.user.version,
         tenantRoles: [{...data.tenant, roles: [data.role]}]
      });
      
      channel.ack(msg);
   }
}