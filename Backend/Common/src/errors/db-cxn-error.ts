import { CustomError, IResponse } from "./custom-error";
import HttpStatus from 'http-status';

export class DatabaseConnectionError extends CustomError {
   code: number;

   constructor(params: IResponse = {code: HttpStatus.INTERNAL_SERVER_ERROR, message: `An unexpected error occured on the DB while processing request`}) {
      super(params);
      // Add this because we are extending a built in class
      Object.setPrototypeOf(this, DatabaseConnectionError.prototype)
      this.code = params.code;
      this.message = params.message;
   }
}