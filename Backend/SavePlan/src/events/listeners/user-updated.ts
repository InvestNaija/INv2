import { Exception, INLogger, Listener, Subjects, UserUpdatedEvent } from "@inv2/common";
import { Channel, Message } from "amqplib";
import { TYPES } from "../../business/types";
import { IUserRepository } from "../../business/repositories/IUserRepository";
import { container } from '../../inversify.config';

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
   private userRepo: IUserRepository = container.get<IUserRepository>(TYPES.IUserRepository);

   readonly subject = Subjects.UserUpdated; 
   queueName = 'user-updated';
   async onMessage(data: UserUpdatedEvent['data'], channel: Channel, msg: Message): Promise<void> {
      try {
         
         if(!data.user!.id || !data.user!.version) throw new Exception({code: 400, message: `User Id and version are required for update`});
         console.log('======> SavePlan received user updated with id: ', data.user!.id,);

         await this.userRepo.update(data.user!.id, {
            version: data.user!.version,
            details: {...(data.user), ...data.user},
            tenantRoles: {...(data.tenant), ...data.tenant},
         });
         // const user = await User.findOne({ where: {id: data.user!.id, version: data.user!.version-1}});
         // if(!user) throw new Exception({code: 400, message: `User with id: ${data.user!.id} and version: ${data.user!.version-1} not found`});

         // await user.update({
         //    version: data.user!.version,
         //    details: {...(user.toJSON().details), ...data.user},
         //    tenantRoles: {...(user.toJSON().tenantRoles), ...data.tenant},
         // });
         channel.ack(msg);
         console.log(`Message acknowledged`);
      } catch (err) {
         const error = (err as Error);
         INLogger.log.error(error!.message,);
         // if(error instanceof CustomError) throw new Exception(error);
         // throw new Exception({code: 500, message: error!.message, success: false});
      }

      
   }
}