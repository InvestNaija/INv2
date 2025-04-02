import { NextFunction, Request, Response } from 'express';
import { Exception, handleError, INLogger, JoiMWDecorator } from "@inv2/common";

import { AdminService } from '../services';
import { AdminValidation } from '../validations/admin.schema';
import { NotificationFactory } from '../services/notification/factory/notification.factory';
import { BaseNotificationFactory } from '../services/notification/factory/base-notification.factory';
import { Notification } from '../services/notification/factory/notification';
import { NotificationType } from '../services/notification/INotifiable';

export class AdminController {
   public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const saveplanSvc = new AdminService;
         const saveplan = await saveplanSvc.list(req.params.type);
         res.status(saveplan.code).json(saveplan);
         profiler.done({service: `SavePlan`, message: `List of saveplas retrieved successfully`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
   @JoiMWDecorator(AdminValidation.create)
   public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {

      const svc = new Notification(
         [ NotificationType.EMAIL, NotificationType.SMS ],
         {
            from: { firstName: 'InvestNaija', email: 'noreply@investnaija.com', phone: '+2347065725667' },
            to: [{firstName: 'Abimbola', email: 'infinitizon@gmail.com', phone: '+2347065725667'},{firstName: 'Juwon', email: 'abimbola.d.hassan@gmail.com', phone: '+2347065725667'}],
            message: "This is a test message"
         }
      );
      svc.attachments = ['wer',456];
      const notyFactory: BaseNotificationFactory[] = new NotificationFactory().createFactory(svc);
      notyFactory.forEach(noty=>noty.notify());
      const profiler = INLogger.log.startTimer();
      try {         
         const adminSvc = new AdminService;
         const saveplan = await adminSvc.create(req.body);
         res.status(saveplan.code).json(saveplan);
         profiler.done({service: `SavePlan`, message: `New SavePlan created successfully => ${JSON.stringify(saveplan.data)}`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
   @JoiMWDecorator(AdminValidation.update)
   public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const adminSvc = new AdminService;
         const saveplan = await adminSvc.update(req.params.id, req.body);
         res.status(saveplan.code).json(saveplan);
         
         profiler.done({service: `SavePlan`, level: 'info', message: `Update SavePlan with id ${req.params.id} successfully`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
}