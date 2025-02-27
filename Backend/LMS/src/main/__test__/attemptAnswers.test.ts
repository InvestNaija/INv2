import request from "supertest";
import { app } from "../../app";
import { Quiz } from "../../database/sequelize/INv2/models/Quiz";
import { QuizAttempt } from "../../database/sequelize/INv2/models/QuizAttempt";
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
   quizAttempt = await QuizAttempt.create({
      quizId: getAllQuiz[0].id,
      userId: '087e7b7f-bf68-4d63-907b-9a9374a89420',
   });
   console.log(`Quiz.findAll took ${endTime - startTime} ms`);
   console.log('getAllQuiz length:', getAllQuizAttempts.length);
   // x
}, 60000); // Set timeout for beforeAll hook


it(`Returns 200 answer quiz attempt`, async () => {
   console.log('Starting test');
   const startTime = Date.now();
   const payload = {
      answerGiven: 'Test answer',
      questionId: getAllQuestions[0].id,
      quizAttepmtId: quizAttempt.id
   };
   const response = await request(app)
      .post(`${baseUrl}`)
      .set(headers)
      .send(payload);
   console.log(payload);
   
   const endTime = Date.now();
   console.log(`Request took ${endTime - startTime} ms`);
   expect(response.status).toEqual(201);
}, 60000);

it(`Returns 200 answer quiz attempt`, async () => {
   console.log('Starting test');
   const startTime = Date.now();
   const response = await request(app)
      .get(`${baseUrl}`)
      .set(headers)
      .send();
   const endTime = Date.now();
   console.log(`Request took ${endTime - startTime} ms`);
   expect(response.status).toEqual(200);
}, 60000);

it(`Returns 200 answer quiz attempt`, async () => {
   console.log('Starting test');
   const startTime = Date.now();
   const response = await request(app)
      .get(`${baseUrl}?search=Test`)
      .set(headers)
      .send();
   const endTime = Date.now();
   console.log(`Request took ${endTime - startTime} ms`);
   quizAttempt = response.body.data[0];
   expect(response.status).toEqual(200);
}, 60000);


it(`Returns 200 after updating quiz attempt`, async () => {
   console.log('Starting test');
   const startTime = Date.now();
   const response = await request(app)
      .patch(`${baseUrl}/${quizAttempt.id}`)
      .set(headers)
      .send({
         answerGiven: 'Test answer updated'
      });
   const endTime = Date.now();
   console.log(`Request took ${endTime - startTime} ms`);
   
   expect(response.status).toEqual(200);
}, 60000);
it(`Returns 200 after updating quiz attempt`, async () => {
   console.log('Starting test');
   const startTime = Date.now();
   const response = await request(app)
      .delete(`${baseUrl}/${quizAttempt.id}`)
      .set(headers)
      .send({
         answerGiven: 'Test answer updated'
      });
   const endTime = Date.now();
   console.log(`Request took ${endTime - startTime} ms`);
   
   expect(response.status).toEqual(200);
}, 60000);