import { Listener, Subjects, UserCreatedEvent } from "@inv2/common";
import { Channel, Message } from "amqplib";
import { User, } from "../../domain/sequelize/INv2";

export class UserCreatedListener extends Listener<UserCreatedEvent> {
   readonly subject = Subjects.UserCreated;
   queueName = 'auth-service';
   onMessage(data: UserCreatedEvent['data'], channel: Channel, msg: Message): void {
      console.log('======> LMS received user created with id: ', data.user!.id,);

      const processMessage = async () => {
         try {
            await User.upsert({
               id: data.user!.id,
               pId: data.user!.pId,
               details: data.user as any,
               tenantRoles: [{ ...data.tenant, roles: [data.role] }] as any
            });
            channel.ack(msg);
         } catch (error) {
            console.error('Error creating/updating user in LMS:', error);
            channel.ack(msg);
         }
      };

      processMessage();
   }
}