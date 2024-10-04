import { Log } from '../../database/mongo/INv2/models/logs';
import { LogCreatedEvent, CustomError, Exception, IResponse, } from "@inv2/common";

export class LogService {
   async create(data: LogCreatedEvent['data']): Promise<IResponse> {
      const session = await Log.startSession();
      session.startTransaction();
      try {
         const log = Log.build(data);
         await log.save();

         await session.commitTransaction();
         return { success: true, code: 200, message: `User created successfully`, data: log };
      } catch (error) {         
         await session.abortTransaction();
         session.endSession();
         if(error instanceof CustomError) throw new Exception(error);
         else if(error instanceof Error) throw new Exception({code: 500, message: error.message});
         else return new Exception({code: 500, message: `An error occured`, success: false});
      }
   }
}