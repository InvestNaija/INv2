import { CustomError, IResponse } from "./custom-error";
import HttpStatus from 'http-status';

export class BadRequestError extends CustomError {
   code: number;

   constructor(params: IResponse = {code: HttpStatus.UNAUTHORIZED, message: `An unexpected error occured while processing request`}) {
      super(params);
      // Add this because we are extending a built in javascript class
      Object.setPrototypeOf(this, BadRequestError.prototype);
      this.code = params.code;
      this.message = params.message;
   }

   // serializeErrors(): IResponse {
   //    return { code: this.code, success: false, message: this.message };
   // }
}