import { controller, httpGet, httpPatch, httpPost, requestBody, requestParam } from 'inversify-express-utils';
import { NextFunction, Request, Response } from 'express';
import { Exception, handleError, INLogger, JoiMWDecorator } from "@inv2/common";

import { AdminService } from '../../business/services';
import { AdminValidation } from '../validations/admin.schema';
import { SaveplanDto } from '../../_dtos';
// import { NotificationFactory } from '../../business/services/notification/factory/notification.factory';
// import { BaseNotificationFactory } from '../../business/services/notification/factory/base-notification.factory';
// import { Notification } from '../../business/services/notification/factory/notification';
// import { NotificationType } from '../../business/services/notification/INotifiable';

@controller("/saveplan")
export class GenericSaveplanController {
   constructor(private readonly adminSvc: AdminService){}

   @httpGet("/:type?")
   public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const saveplan = await this.adminSvc.list(req.params.type);
         res.status(saveplan.code).json(saveplan);
         profiler.done({service: `SavePlan`, message: `List of saveplas retrieved successfully`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
   @JoiMWDecorator(AdminValidation.create)
   @httpPost("/")
   public async create(req: Request, res: Response, next: NextFunction): Promise<void> {

      // const svc = new Notification(
      //    [ NotificationType.EMAIL, NotificationType.SMS ],
      //    {
      //       from: { firstName: 'InvestNaija', email: 'noreply@investnaija.com', phone: '+2347065725667' },
      //       to: [{firstName: 'Abimbola', email: 'infinitizon@gmail.com', phone: '+2347065725667'},{firstName: 'Juwon', email: 'abimbola.d.hassan@gmail.com', phone: '+2347065725667'}],
      //       message: "This is a test message"
      //    }
      // );
      // svc.attachments = ['wer',456];
      // const notyFactory: BaseNotificationFactory[] = new NotificationFactory().createFactory(svc);
      // notyFactory.forEach(noty=>noty.notify());
      const profiler = INLogger.log.startTimer();
      try {         
         const saveplan = await this.adminSvc.create(req.body);
         res.status(saveplan.code).json(saveplan);
         profiler.done({service: `SavePlan`, message: `New SavePlan created successfully => ${JSON.stringify(saveplan.data)}`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
   @JoiMWDecorator(AdminValidation.update)
   @httpPatch("/:saveplanId")
   public async update(@requestParam("saveplanId") id: string, @requestBody() body: Partial<SaveplanDto>, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();  
      try {         
         const saveplan = await this.adminSvc.update(id, body);
         res.status(saveplan.code).json(saveplan);
         
         profiler.done({service: `SavePlan`, level: 'info', message: `Update SavePlan with id ${id} successfully`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
}