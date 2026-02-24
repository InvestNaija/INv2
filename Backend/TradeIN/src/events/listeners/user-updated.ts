import { CustomError, Exception, Listener, Subjects, UserUpdatedEvent } from "@inv2/common";
import { Channel, Message } from "amqplib";
import { User, } from "../../domain/sequelize/INv2";

export class UserUpdatedListener extends Listener<UserUpdatedEvent> {
   readonly subject = Subjects.UserUpdated;
   queueName = 'auth-service';
   // @ts-ignore
   onMessage(data: UserUpdatedEvent['data'], channel: Channel, msg: Message): void {
      const processMessage = async () => {
         try {

            if (!data.user!.id || !data.user!.version) throw new Exception({ code: 400, message: `User Id and version are required for update` });
            console.log('======> TradeIN received user updated with id: ', data.user!.id,);

            const user = await User.findOne({ where: { id: data.user!.id, version: data.user!.version - 1 } });
            if (!user) throw new Exception({ code: 400, message: `User not found` });

            // @ts-ignore
            const userData: any = data;
            await user.update({
               version: userData.user!.version,
               details: { ...(user.toJSON().details), ...userData.user },
               tenantRoles: { ...(user.toJSON().tenantRoles), ...userData.tenant },
            });
         } catch (err) {
            const error = (err as Error);
            if (error instanceof CustomError) throw new Exception(error);
            throw new Exception({ code: 500, message: error!.message, success: false });
         }

         channel.ack(msg);
         console.log(`Message acknowledged`);

      };
      processMessage();
   }
}