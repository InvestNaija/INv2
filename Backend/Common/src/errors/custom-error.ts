import { ValidationError, SequelizeScopeError, DatabaseError } from "sequelize";

export interface IResponse {
   code: number;
   success?: boolean;
   message: string;
   data?: any;
   show?: boolean;
   line?: number;
   file?: string;
   extra?: any;
};

export abstract class CustomError extends Error {
   abstract code: number;
   line = 0; file = '';
   constructor(public params: IResponse) {
      super(params.message);
      // Add this because we are extending a built in class
      Object.setPrototypeOf(this, CustomError.prototype)

      const reg = new RegExp(/at\s+((\S+)\s)?\((\S+):(\d+):(\d+)\)/);
      const stact = this.stack?.split('\n').at(1);
      const caller = reg.exec(stact!);
      caller?.[4] ? this.line = parseInt(caller?.[4]) : 0;
      caller?.[2] ? this.file = caller?.[2] : 0;
      this.params = { ...this!.params, line: parseInt(caller?.[4]||''), file: caller?.[2] };
   }
   
   serializeErrors(): IResponse {
      const found = findVal(this.params, 'params');
      this.params = found??this.params
      return { ...this.params };
   }
}

const findVal = (object: any, key: string) =>{
   var value;
   Object.keys(object).some(function(k) {
       if (k === key && !object[k][k]) {
           value = object[k];
           return true;
       }
       if (object[k] && typeof object[k] === 'object') {
           value = findVal(object[k], key);
           return value !== undefined;
       }
   });
   return value;
}
export class Exception extends CustomError {
   code: number;
   constructor(public params: IResponse) {
      super(params);
      this.params = { line: this.line, file: this.file, ...this.params, ...params, };
      this.code = params.code || 400;
      // Add this because we are extending a built in class
      Object.setPrototypeOf(this, Exception.prototype)
   }
   // serializeErrors(): IResponse {
   //    const found = findVal(this.params, 'params');
   //    this.params = found??this.params
   //    return { ...this.params };
   // }
}

export const handleError = (error: Error): IResponse => {
   if (error instanceof CustomError) {
      throw new Exception(error);
   } else if (error instanceof ValidationError) {
      return { code: 400, message: error.errors.map(e => e.message).join(", "), success: false };
   } else if (error instanceof DatabaseError) {
      return { code: 500, message: "Database error occurred", success: false };
   } else if (error instanceof SequelizeScopeError) {
      return { code: 500, message: "Scope error with the database query", success: false };
   }
   return { code: 500, message: "An unknown error occurred", success: false };
}