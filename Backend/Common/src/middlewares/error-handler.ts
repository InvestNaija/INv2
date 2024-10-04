import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {

   if(err instanceof CustomError) {
      const serialized = err.serializeErrors();
       return res.status(serialized.code).send({ success: false, ...serialized });
   }

   res.status(400).send({
      errors: { success: false, message: `Something went wrong while processing your request`}
   })
   
}