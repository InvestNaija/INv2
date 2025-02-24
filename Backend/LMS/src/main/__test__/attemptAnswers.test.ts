import request from "supertest";
import { app } from "../../app";
import { Quiz } from "../../database/sequelize/INv2/models/Quiz";
import { QuizAttempt } from "../../database/sequelize/INv2/models/QuizAttempt";
import { QuizAttemptAnswer } from "../../database/sequelize/INv2/models/QuizAttemptAnswer";
import { Question } from "../../database/sequelize/INv2/models/Question";


// Set a global timeout for all tests in this file to prevent overrides
jest.setTimeout(60000);

const headers = {
   "authorization": global.getJWTAuth('CUSTOMER'),
};
let baseUrl: string = '/api/v2/attempt/answer';
let getAllQuizAttempts: any;
let getAllQuiz: any;
let getAllQuestions: any;
let quizAttempt: any;

beforeAll(async () => {
   console.log('Starting beforeAll');
   const startTime = Date.now();
   getAllQuizAttempts = await QuizAttempt.findAll();
   getAllQuestions = await Question.findAll();
   getAllQuiz = await Quiz.findAll();
   const endTime = Date.now();
   console.log(`Quiz.findAll took ${endTime - startTime} ms`);
   console.log('getAllQuiz length:', getAllQuizAttempts.length);
   if (getAllQuizAttempts.length === 0) {
      console.log('No quizzes found');
      throw new Error('No quizzes found in the database');
   }
}, 60000); // Set timeout for beforeAll hook

it(`Returns 200 answer quiz attempt`, async () => {
   console.log('Starting test');
   const quizId = getAllQuizAttempts[0].id;
   console.log('quizId:', quizId);
   const startTime = Date.now();
   const response = await request(app)
      .post(`${baseUrl}`)
      .set(headers)
      .send({
         answerGiven: 'Test answer',
         questionId: getAllQuestions[0].id,
         quizAttemptId: getAllQuizAttempts[0].id
      });
   const endTime = Date.now();
   console.log(`Request took ${endTime - startTime} ms`);
   quizAttempt = response.body.data;
   expect(response.status).toBe(201);
}, 60000);