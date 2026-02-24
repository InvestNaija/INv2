import request from "supertest";
import { app } from "../../app";

const headers = {
   "authorization": global.getJWTAuth('CUSTOMER'),
};

it('Fetches quiz, question, user and creates a quiz question', async () => {
   const quizData = {
      userId: "087e7b7f-bf68-4d63-907b-9a9374a89420",
      title: "Quiz One",
      detail: "This is quiz one",
      startDate: "2024-11-11T00:00:00.000Z",
      endDate: "2025-12-12T00:00:00.000Z",
      isImmediateAnswer: true
   };
  
   await request(app)
      .post('/api/v2/quizes')
      .set(headers)
      .send(quizData)
      .expect(201);
      
   const quizResponse = await request(app)
      .get('/api/v2/quizes')
      .set(headers)
      .expect(200);

   const quizzes = quizResponse.body.data;
   expect(quizzes.length).toBeGreaterThan(0);
   const quizId = quizzes[0].id;

   const questionData = {
      userId: "087e7b7f-bf68-4d63-907b-9a9374a89420",
      title: "Question Title",
      details: "Question details",
      type: 100
   };
   await request(app)
      .post('/api/v2/questions') 
      .set(headers)
      .send(questionData)
      .expect(201);

   const questionResponse = await request(app)
      .get('/api/v2/questions')
      .set(headers)
      .expect(200);

   const questions = questionResponse.body.data;
   expect(questions.length).toBeGreaterThan(0);
   const questionId = questions[0].id;
   const userId = questions[0].userId;

   const createResponse = await request(app)
      .post('/api/v2/quiz/questions')
      .set(headers)
      .send({
         quizId,
         questionId, 
         userId,
         passScore: 200,
         failScore: 50,
         order: 9
      })
      .expect(201);

   expect(createResponse.body.success).toBe(true);
   expect(createResponse.body.code).toBe(201);
   expect(createResponse.body.message).toBe("Record created successfully");

   const createdQuizQuestion = createResponse.body.data;
   expect(createdQuizQuestion).toHaveProperty("id");
   expect(createdQuizQuestion.quizId).toBe(quizId);
   expect(createdQuizQuestion.questionId).toBe(questionId);
   expect(createdQuizQuestion.userId).toBe(userId);
}, 20000);

it('Fetches all quiz questions', async () => {
   const response = await request(app)
      .get('/api/v2/quiz/questions')
      .set(headers)
      .expect(200);

   expect(response.body.success).toBe(true);
   expect(response.body.code).toBe(200);
   expect(response.body.message).toBe("Records found");

   const quizQuestions = response.body.data;
   expect(quizQuestions.length).toBeGreaterThan(0);

   const firstQuizQuestion = quizQuestions[0];
   expect(firstQuizQuestion).toHaveProperty("id");
   expect(firstQuizQuestion).toHaveProperty("quizId");
   expect(firstQuizQuestion).toHaveProperty("questionId");
   expect(firstQuizQuestion).toHaveProperty("userId");
   expect(firstQuizQuestion).toHaveProperty("order");
}, 20000);

it('Fetches a quiz question from existing records and updates it successfully', async () => {
   const fetchAllResponse = await request(app)
      .get('/api/v2/quiz/questions')
      .set(headers)
      .expect(200);

   expect(fetchAllResponse.body.success).toBe(true);
   expect(fetchAllResponse.body.code).toBe(200);
   const quizQuestions = fetchAllResponse.body.data;

   expect(quizQuestions.length).toBeGreaterThan(0);

   const quizQuestionToUpdate = quizQuestions[0];
   const quizQuestionId = quizQuestionToUpdate.id;

   const updatePayload = {
      passScore: 200,
      failScore: 50,
      order: quizQuestionToUpdate.order || 9
   };

   const updateResponse = await request(app)
      .put(`/api/v2/quiz/questions/${quizQuestionId}`) 
      .set(headers)
      .send(updatePayload)
      .expect(200);

   expect(updateResponse.body.success).toBe(true);
   expect(updateResponse.body.code).toBe(200);
   expect(updateResponse.body.message).toBe("Record updated successfully");

   const updatedQuizQuestion = updateResponse.body.data;

   expect(updatedQuizQuestion).toHaveProperty("id");
   expect(updatedQuizQuestion).toHaveProperty("passScrore");
   expect(updatedQuizQuestion).toHaveProperty("failScrore");
   expect(updatedQuizQuestion).toHaveProperty("order");
}, 20000);

it('Fetches a quiz question from existing records and deletes it successfully', async () => {
   const fetchAllResponse = await request(app)
      .get('/api/v2/quiz/questions')
      .set(headers)
      .expect(200);

   expect(fetchAllResponse.body.success).toBe(true);
   expect(fetchAllResponse.body.code).toBe(200);
   const quizQuestions = fetchAllResponse.body.data;

   expect(quizQuestions.length).toBeGreaterThan(0);

   const quizQuestionToDelete = quizQuestions[0];
   const quizQuestionId = quizQuestionToDelete.id;

   const deleteResponse = await request(app)
      .delete(`/api/v2/quiz/questions/${quizQuestionId}`)
      .set(headers)
      .expect(200);

   expect(deleteResponse.body.success).toBe(true);
   expect(deleteResponse.body.code).toBe(200);
   expect(deleteResponse.body.message).toBe("Record deleted successfully");
}, 20000);
