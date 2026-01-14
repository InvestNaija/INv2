import { INLogger, Listener, Subjects, UserCreatedEvent } from "@inv2/common";
import { Channel, Message } from "amqplib";
import { TYPES } from "../../business/types";
import { IUserRepository } from "../../business/repositories/IUserRepository";
import { container } from '../../inversify.config';

// @injectable()
export class UserCreatedListener extends Listener<UserCreatedEvent> {
   private userRepo: IUserRepository = container.get<IUserRepository>(TYPES.IUserRepository);

   // @inject(TYPES.IUserRepository) private userRepo!: IUserRepository;
   readonly subject = Subjects.UserCreated;
   queueName = 'auth-service';
   async onMessage(data: UserCreatedEvent['data'], channel: Channel, msg: Message): Promise<void> {
      try { 
         console.log('======> SavePlan received user created with id: ', data.user!.id,);
         await this.userRepo.create({
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
