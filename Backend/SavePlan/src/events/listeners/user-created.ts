import { INLogger, Listener, Subjects, UserCreatedEvent } from "@inv2/common";
import { Channel, Message } from "amqplib";
import { User, } from "../../database/sequelize/INv2";

export class UserCreatedListener extends Listener<UserCreatedEvent> {
   readonly subject = Subjects.UserCreated; 
   queueName = 'auth-service';
   async onMessage(data: UserCreatedEvent['data'], channel: Channel, msg: Message): Promise<void> {
      try {
         console.log('======> SavePlan received user created with id: ', data.user!.id,);
         await User.create({
            id: data.user!.id,
            pId: data.user!.pId,
            details: data.user,
            // version: data.user.version,
            tenantRoles: [{...data.tenant, roles: [data.role]}]
         });
         
         channel.ack(msg);
      } catch (err) {
         const error = (err as Error);
         INLogger.log.error(error!.message,);
         // if(error instanceof CustomError) throw new Exception(error);
         // throw new Exception({code: 500, message: error!.message, success: false});
      }
   }
}