import { controller, httpGet, httpPatch, httpPost } from 'inversify-express-utils';
import { NextFunction, Request, Response } from 'express';
import { Exception, handleError, INLogger, JoiMWDecorator } from "@inv2/common";

import { GlService } from '../../business/services';
import { AdminValidation } from '../validations/admin.schema';
// import { NotificationFactory } from '../../business/services/notification/factory/notification.factory';
// import { BaseNotificationFactory } from '../../business/services/notification/factory/base-notification.factory';
// import { Notification } from '../../business/services/notification/factory/notification';
// import { NotificationType } from '../../business/services/notification/INotifiable';

@controller("/admin/saveplan/:saveplanId/gls")
export class SaveplanGlController {
   constructor(private readonly glSvc: GlService){}


   // router.post('/create', controller.create);
   // router.put('/update/:id', controller.update);
   // router.delete('/delete/:id', controller.delete);
   // router.get('/get-one/:id', controller.getOne);
   // router.get('/get-all/:saveplan_id', controller.getAll);\
   // router.get('/get-all-transaction-type', controller.getGLTxnType)

   @JoiMWDecorator(AdminValidation.create)
   @httpPost("/")
   public async createGls(req: Request, res: Response, next: NextFunction): Promise<void> {                 
      const profiler = INLogger.log.startTimer();
      try {
         const saveplan = await this.glSvc.create(req.params.saveplanId, req.body);
         res.status(saveplan.code).json(saveplan);
         profiler.done({service: `SavePlan`, message: `New SavePlan created successfully => ${JSON.stringify(saveplan.data)}`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));        
      }
   }
   @httpGet("/")
   public async getGls(req: Request, res: Response, next: NextFunction): Promise<void> {                 
      const profiler = INLogger.log.startTimer();
      try {         
         const gls = await this.glSvc.findAll(req.params.saveplanId);
         res.status(gls.code).json(gls);
         profiler.done({service: `SavePlan`, message: `GLs for saveplan: ${req.params.saveplanId} fetched successfully => ${JSON.stringify(gls.data)}`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));        
      }
   }
   @httpGet("/:id")
   public async getGl(req: Request, res: Response, next: NextFunction): Promise<void> {                 
      const profiler = INLogger.log.startTimer();
      try {         
         const gl = await this.glSvc.findOne( req.params.id);
         res.status(gl.code).json(gl);
         profiler.done({service: `SavePlan`, message: `Gl with id: ${req.params.id} fetched successfully => ${JSON.stringify(gl.data)}`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));        
      }
   }
   @JoiMWDecorator(AdminValidation.update)
   @httpPatch("/:id")
   public async update(req: Request, res: Response, next: NextFunction ): Promise<void> {
      const profiler = INLogger.log.startTimer();
      try {         
         const gl = await this.glSvc.update(req.params.id, req.body);
         res.status(gl.code).json(gl);
         
         profiler.done({service: `SavePlan`, level: 'info', message: `Updated GL with id: ${req.params.id} successfully`});
      } catch (error: unknown|Error) {
         next(new Exception(handleError(error)));
      }
   }
}