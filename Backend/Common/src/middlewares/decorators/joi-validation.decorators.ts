/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, NextFunction } from 'express';
import { Exception } from '../../errors/custom-error';
import Joi,{ Schema } from 'joi';

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

const pick = (object: { [key: string]: any}, keys: string[]) => {
  return keys.reduce((obj: { [key: string]: any}, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      // eslint-disable-next-line no-param-reassign
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

const check = (schema: { [key: string]: Schema }, data: { [key: string]: any}) => {
  const object = pick(data, Object.keys(schema));
  return Joi.compile(schema)
    .prefs({ errors: { label: 'key' } })
    .validate(object);
};

export const Validate = (schema: { [key: string]: Schema }, data: { [key: string]: any}) => {
  const { value, error } = check(schema, data);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(', ');
    // throw new AppError(errorMessage, { status: 400, name: error.name });
    return error
  }

  return;
};
/**
 *
 * making use of typescript decorators here. the aim here is to
 * validate requests to ensure they conform to the schema
 *
 */

export function JoiMWDecorator(schema: { [key: string]: Schema }): IJoiDecorator {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0];
      const next: NextFunction = args[2];
      
      const validSchema = pick(schema, ['params', 'query', 'body']);
      const object = pick(req, Object.keys(validSchema));
      const { value, error } = check(validSchema, object);

      if (error) {
        const errorMessage = error.details
          .map((details) => details.message)
          .join(', ');
        return next(new Exception({ code: 400, message: errorMessage }))
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
