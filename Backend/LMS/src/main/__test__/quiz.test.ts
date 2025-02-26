import request from "supertest";
import { app } from "../../app";

const headers = {
   "authorization": global.getJWTAuth('CUSTOMER'),
};

it('Creates a new quiz successfully', async () => {
   const quizData = {
      userId: "ebe5e1c4-e2ff-4441-963a-e9ab04b7f9e8",
      title: "Quiz One",
      detail: "This is quiz one",
      startDate: "2024-11-11T00:00:00.000Z",
      endDate: "2025-12-12T00:00:00.000Z",
      isImmediateAnswer: true
   };

   const response = await request(app)
      .post('/api/v2/quizes')
      .set(headers)
      .send(quizData)
      .expect(201);

   expect(response.body.success).toBe(true);
   expect(response.body.code).toBe(201);
   expect(response.body.message).toBe("Record created successfully");

   const createdQuiz = response.body.data;
   expect(createdQuiz).toHaveProperty("id");
   expect(createdQuiz.title).toBe(quizData.title);
   expect(createdQuiz.userId).toBe(quizData.userId);
   expect(createdQuiz.detail).toBe(quizData.detail);
   expect(new Date(createdQuiz.startDate).toISOString()).toBe(quizData.startDate);
   expect(new Date(createdQuiz.endDate).toISOString()).toBe(quizData.endDate);
   expect(createdQuiz.isImmediateAnswer).toBe(quizData.isImmediateAnswer);
}, 20000);

it(`Returns 200 on successful fetch`, async ()=>{
   const response = await request(app)
      .get('/api/v2/quizes')
      .set(headers)
      .send()
      .expect(200);
   
   expect(response.body.success).toBe(true);
   expect(response.body.code).toBe(200);
   expect(response.body.message).toBe("Records found");
   expect(response.body.data).toBeInstanceOf(Array);
   expect(response.body.data.length).toBeGreaterThan(0);

   const quiz = response.body.data[0];
   expect(quiz).toHaveProperty("id");
   expect(quiz).toHaveProperty("userId");
   expect(quiz).toHaveProperty("title");
   expect(quiz).toHaveProperty("detail");
   expect(quiz).toHaveProperty("startDate");
   expect(quiz).toHaveProperty("endDate");
   expect(quiz).toHaveProperty("isImmediateAnswer");
   expect(quiz).toHaveProperty("createdAt");
   expect(quiz).toHaveProperty("updatedAt");
   expect(quiz).toHaveProperty("deletedAt", null);
}, 20000);

it('Fetches an existing quiz and updates it successfully', async () => {
   const quizData = {
      userId: "ebe5e1c4-e2ff-4441-963a-e9ab04b7f9e8",
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

   const fetchResponse = await request(app)
      .get('/api/v2/quizes')
      .set(headers)
      .expect(200);

   const existingQuiz = fetchResponse.body.data[0];
   expect(existingQuiz).toHaveProperty("id");

   const quizId = existingQuiz.id;

   const updateData = {
      title: "Updated QUIZ Title",
      detail: "Updated quiz details"
   };

   const updateResponse = await request(app)
      .patch(`/api/v2/quizes/${quizId}`) 
      .set(headers)
      .send(updateData)
      .expect(200);

   expect(updateResponse.body.success).toBe(true);
   expect(updateResponse.body.code).toBe(200);
   expect(updateResponse.body.message).toBe("Record updated successfully");

   const updatedQuiz = updateResponse.body.data;
   expect(updatedQuiz).toHaveProperty("id", quizId);
   expect(updatedQuiz).toHaveProperty("title", "Updated QUIZ Title");
   expect(updatedQuiz).toHaveProperty("detail", "Updated quiz details");

   expect(updatedQuiz).toHaveProperty("createdAt", existingQuiz.createdAt);
   expect(updatedQuiz).toHaveProperty("startDate", existingQuiz.startDate);
   expect(updatedQuiz).toHaveProperty("endDate", existingQuiz.endDate);
   expect(updatedQuiz).toHaveProperty("isImmediateAnswer", existingQuiz.isImmediateAnswer);
}, 20000);

it('Deletes an existing quiz successfully', async () => {
   const fetchResponse = await request(app)
      .get('/api/v2/quizes')
      .set(headers)
      .expect(200);

   const existingQuiz = fetchResponse.body.data[0];
   expect(existingQuiz).toHaveProperty("id");

   const quizId = existingQuiz.id;

   const deleteResponse = await request(app)
      .delete(`/api/v2/quizes/${quizId}`)
      .set(headers)
      .expect(200);

   expect(deleteResponse.body.success).toBe(true);
   expect(deleteResponse.body.code).toBe(200);
   expect(deleteResponse.body.message).toBe("Record deleted successfully");

   await request(app)
      .get(`/api/v2/quizes/${quizId}`)
      .set(headers)
      .expect(404);
}, 20000);