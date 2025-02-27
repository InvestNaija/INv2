import request from "supertest";
import { app } from "../../app";
import { Quiz } from "../../database/sequelize/INv2/models/Quiz";

// Set a global timeout for all tests in this file to prevent overrides
jest.setTimeout(60000);

const headers = {
   "authorization": global.getJWTAuth('CUSTOMER'),
};

let getAllQuiz: any;
let quizAttempt: any;

beforeAll(async () => {
   console.log('Starting beforeAll');
   const startTime = Date.now();
   getAllQuiz = await Quiz.findAll();
   const endTime = Date.now();
   console.log(`Quiz.findAll took ${endTime - startTime} ms`);
   console.log('getAllQuiz length:', getAllQuiz.length);
   if (getAllQuiz.length === 0) {
      console.log('No quizzes found');
      throw new Error('No quizzes found in the database');
   }
}, 60000); // Set timeout for beforeAll hook

it(`Returns 200 on successful start of quiz`, async () => {
   console.log('Starting test');
   const quizId = getAllQuiz[0].id;
   console.log('quizId:', quizId);
   const startTime = Date.now();
   const response = await request(app)
      .post(`/api/v2/lms/quiz/attempt/start/${quizId}`)
      .set(headers)
      .send();
   const endTime = Date.now();
   console.log(`Request took ${endTime - startTime} ms`);
   quizAttempt = response.body.data;
   expect(response.status).toBe(201);
}, 60000);

it(`Returns 200 on successful end of quiz`, async () => {
   console.log('Starting test');
   const quizId = getAllQuiz[0].id;
   console.log('quizId:', quizId);
   const startTime = Date.now();
   const response = await request(app)
      .post(`/api/v2/lms/quiz/attempt/end/${quizId}`)
      .set(headers)
      .send();
   const endTime = Date.now();
   console.log(`Request took ${endTime - startTime} ms`);
   expect(response.status).toBe(200);
}, 60000);

it(`Returns 200 after getting all quiz attempts`, async () => {
   console.log('Starting test');
   const quizId = getAllQuiz[0].id;
   console.log('quizId:', quizId);
   const startTime = Date.now();
   const response = await request(app)
      .get(`/api/v2/lms/quiz/attempt?quiz=${quizId}`)
      .set(headers)
      .send();
   const endTime = Date.now();
   console.log(`Request took ${endTime - startTime} ms`);
   expect(response.status).toBe(200);
}, 60000);

it(`Returns 200 after deleting quiz attempt`, async () => {
   console.log('Starting test');
   const quizId = getAllQuiz[0].id;
   console.log('quizId:', quizId);
   const startTime = Date.now();
   const response = await request(app)
      .delete(`/api/v2/lms/quiz/attempt/${quizAttempt.id}`)
      .set(headers)
      .send();
   const endTime = Date.now();
   console.log(`Request took ${endTime - startTime} ms`);
   expect(response.status).toBe(200);
}, 60000);