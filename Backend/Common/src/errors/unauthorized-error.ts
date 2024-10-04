import { CustomError, IResponse } from "./custom-error";
import HttpStatus from 'http-status';

export class UnauthorizedError extends CustomError {
   code: number;
   constructor(params: IResponse = {code: HttpStatus.UNAUTHORIZED, message: `You are not authorized to access resource`}) {
      super(params);
      this.code = params.code;
      // Add this because we are extending a built in javascript class
      Object.setPrototypeOf(this, UnauthorizedError.prototype)
      this.message = params.message
   }

}