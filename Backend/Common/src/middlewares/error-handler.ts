import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error";
import { INLogger } from "../config";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {

   if(err instanceof CustomError) {
      const {file, line, ...serialized} = err.serializeErrors();
      INLogger.log.error(`Error in file: ${file} at line: ${line} => ${serialized.message}`);
      return res.status(serialized.code).send({ success: false, ...serialized });
   }
   INLogger.log.error(`Unhandled error: ${err.message}`);
   res.status(400).send({
      errors: { success: false, message: `Something went wrong while processing your request`}
   });
}