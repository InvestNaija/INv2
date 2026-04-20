import swaggerAutogen from 'swagger-autogen';
import { AuthValidation } from './api/validations/auth.schema';
import { joiToSwagger } from '@inv2/common';

const doc = {
  info: {
    title: 'InvestNaija API - Auth Service',
    description: 'Authentication and User Management Service for InvestNaija v2',
  },
  host: process.env.BACKEND_BASE?.replace('http://', '').replace('/api/v2', '') || 'localhost:3001',
  basePath: '/api/v2/auth',
  schemes: ['http', 'https'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Enter your Bearer token in the format **Bearer &lt;token&gt;**'
    }
  },
  definitions: {
    SignupRequest: joiToSwagger(AuthValidation.signup.body),
    SigninRequest: joiToSwagger(AuthValidation.login.body),
    ChangePasswordRequest: joiToSwagger(AuthValidation.changePassword.body),
    ForgotPasswordRequest: joiToSwagger(AuthValidation.forgotPassword.body),
    ResetPasswordRequest: joiToSwagger(AuthValidation.resetPassword.body),
    Set2FARequest: joiToSwagger(AuthValidation.set2FA.body),
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/app.ts']; // Point to the app entry file

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation generated successfully');
});
