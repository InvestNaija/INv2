import { CustomError, IResponse } from "./custom-error";
import HttpStatus from 'http-status';

export class NotFoundError extends CustomError {
   code: number;

   constructor(params: IResponse = {code: HttpStatus.NOT_FOUND, message: `Resource not found`}) {
      super(params);
      // Add this because we are extending a built in class
      Object.setPrototypeOf(this, NotFoundError.prototype)
      this.code = params.code
      this.message = params.message;
   }
   
}