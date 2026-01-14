import { CustomError, Exception, Listener, Subjects, UserUpdatedEvent } from "@inv2/common";
import { Channel, Message } from "amqplib";
import { User, } from "../../domain/sequelize/INv2";

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
   readonly subject = Subjects.UserUpdated; 
   queueName = 'auth-service';
   async onMessage(data: UserUpdatedEvent['data'], channel: Channel, msg: Message): Promise<void> {
      try {
         
         if(!data.user!.id || !data.user!.version) throw new Exception({code: 400, message: `User Id and version are required for update`});
         console.log('======> LMS received user created with id: ', data.user!.id,);

         const user = await User.findOne({ where: {id: data.user!.id, version: data.user!.version-1}});
         if(!user) throw new Exception({code: 400, message: `User not found`});

         await user.update({
            version: data.user!.version,
            details: {...(user.toJSON().details), ...data.user},
            tenantRoles: {...(user.toJSON().tenantRoles), ...data.tenant},
         });
      } catch (err) {
         const error = (err as Error);
         if(error instanceof CustomError) throw new Exception(error);
         throw new Exception({code: 500, message: error!.message, success: false});
      }

      channel.ack(msg);
      console.log(`Message acknowledged`);
      
   }
}