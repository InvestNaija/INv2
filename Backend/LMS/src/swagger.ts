import swaggerAutogen from 'swagger-autogen';
import { LmsValidation, QuizValidation } from './api/validations/lms.schema';
import { joiToSwagger } from '@inv2/common';

const doc = {
  info: {
    title: 'InvestNaija API - LMS Service',
    description: 'Learning Management System Service for InvestNaija v2',
  },
  host: process.env.BACKEND_BASE?.replace('http://', '').replace('/api/v2', '') || 'localhost:3002',
  basePath: '/api/v2/lms',
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
    CreateLmsRequest: joiToSwagger(LmsValidation.createLms.body),
    UpdateLmsRequest: joiToSwagger(LmsValidation.updateLms.body),
    CreateQuizRequest: joiToSwagger(QuizValidation.createQuiz.body),
    UpdateQuizRequest: joiToSwagger(QuizValidation.updateQuiz.body),
  }
};

const outputFile = './src/swagger-output.json';
const endpointsFiles = ['./src/app.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation generated successfully for LMS');
});
