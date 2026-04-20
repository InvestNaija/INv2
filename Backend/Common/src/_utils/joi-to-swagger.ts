import j2s from 'joi-to-swagger';
import { Schema } from 'joi';

/**
 * Utility to convert Joi schemas to OpenAPI 3.0 component schemas.
 * This ensures that the validation logic remains the single source of truth for documentation.
 * 
 * @param joiSchema - The Joi schema to convert
 * @returns OpenAPI 3.0 schema object
 */
export const joiToSwagger = (joiSchema: Schema) => {
   const { swagger } = j2s(joiSchema);
   return swagger;
};
