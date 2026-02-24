import { Listener, Subjects, UserCreatedEvent } from "@inv2/common";
import { Channel, Message } from "amqplib";
import { User, TradeInProfile, TradeInProfileStatus } from "../../domain/sequelize/INv2";
import { container } from "../../inversify.config";
import { TYPES } from "../../business/types";

export class UserCreatedListener extends Listener<UserCreatedEvent> {
   readonly subject = Subjects.UserCreated;
   queueName = 'auth-service';
   // @ts-ignore
   onMessage(data: UserCreatedEvent['data'], channel: Channel, msg: Message): void {
      console.log('======> TradeIN received user created with id: ', data.user!.id,);

      const processMessage = async () => {
         try {
            // @ts-ignore
            const userData: any = data;
            await User.upsert({
               id: userData.user!.id,
               pId: userData.user!.pId,
               details: userData.user,
               // @ts-ignorex
               tenantRoles: [{ ...userData.tenant, roles: [userData.role] }]
            });

            const activeProvider = container.get<string>(TYPES.ActiveTradeProvider);

            // Create TradeInProfile if it doesn't exist
            const existingProfile = await TradeInProfile.findOne({ where: { userId: userData.user!.id, provider: activeProvider } });
            if (!existingProfile) {
               await TradeInProfile.create({
                  userId: userData.user!.id,
                  status: TradeInProfileStatus.PENDING,
                  externalId: null, // explicitly null
                  provider: activeProvider
               });
               console.log(`Created pending TradeInProfile (Provider: ${activeProvider}) for user ${userData.user!.id}`);
            }

            channel.ack(msg);
         } catch (error) {
            console.error('Error creating/updating user in TradeIN:', error);
            channel.ack(msg);
         }
      };

      processMessage();
   }
}