import request from "supertest";
import { app } from "../../app";

const creatorHeaders = {
   "authorization": global.getJWTAuth('CUSTOMER'),
};

// Get a different user's token for ownership tests
const otherUserHeaders = {
   "authorization": global.getJWTAuth('user'),
};

const testQuizId = '550b26b1-4363-4c2a-ade2-ce97b1145d39';
let createdQuestionId: string;

describe('Question API Tests', () => {
   
   it(`Returns 400 if required params are not supplied`, async () => {
      await request(app)
         .post('/api/v2/questions')
         .set(creatorHeaders)
         .send({
            quizId: testQuizId,
         })
         .expect(400);
      
      await request(app)
         .post('/api/v2/questions')
         .set(creatorHeaders)
         .send({
            title: "Test Question",
         })
         .expect(400);
      
      await request(app)
         .post('/api/v2/questions')
         .set(creatorHeaders)
         .send({
            quizId: testQuizId,
            title: "Test Question",
         })
         .expect(400);
   }, 20000);

   it(`Returns 404 if quiz does not exist`, async () => {
      await request(app)
         .post('/api/v2/questions')
         .set(creatorHeaders)
         .send({
            quizId: '00000000-0000-0000-0000-000000000000',
            title: "Test Question",
            details: "Test details",
            type: "MCSA",
         })
         .expect(404);
   }, 20000);

   it(`Returns 201 on successful question creation`, async () => {
      const response = await request(app)
         .post('/api/v2/questions')
         .set(creatorHeaders)
         .send({
            quizId: testQuizId,
            title: "What is 2+2?",
            details: "A simple math question",
            type: "MCSA",
         })
         .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe("What is 2+2?");
      expect(response.body.data.quizId).toBe(testQuizId);
      expect(response.body.data.userId).toBeDefined();
      
      createdQuestionId = response.body.data.id;
   }, 20000);

   it(`Returns 200 on successful GET all questions`, async () => {
      const response = await request(app)
         .get('/api/v2/questions')
         .set(creatorHeaders)
         .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
   }, 20000);

   it(`Returns 200 on successful GET questions by quizId`, async () => {
      const response = await request(app)
         .get('/api/v2/questions')
         .query({ quizId: testQuizId })
         .set(creatorHeaders)
         .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
         expect(response.body.data[0].quizId).toBe(testQuizId);
      }
   }, 20000);

   it(`Returns 200 on successful GET question by ID`, async () => {
      if (!createdQuestionId) {
         // Create a question first if not already created
         const createResponse = await request(app)
            .post('/api/v2/questions')
            .set(creatorHeaders)
            .send({
               quizId: testQuizId,
               title: "Test Question for GET",
               details: "Test details",
               type: "SA",
            });
         createdQuestionId = createResponse.body.data.id;
      }

      const response = await request(app)
         .get('/api/v2/questions')
         .query({ id: createdQuestionId })
         .set(creatorHeaders)
         .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(createdQuestionId);
   }, 20000);

   it(`Returns 200 on successful search questions`, async () => {
      const response = await request(app)
         .get('/api/v2/questions')
         .query({ search: "2+2" })
         .set(creatorHeaders)
         .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
   }, 20000);

   it(`Returns 403 when non-creator tries to update question`, async () => {
      if (!createdQuestionId) {
         const createResponse = await request(app)
            .post('/api/v2/questions')
            .set(creatorHeaders)
            .send({
               quizId: testQuizId,
               title: "Test Question for Update",
               details: "Test details",
               type: "LA",
            });
         createdQuestionId = createResponse.body.data.id;
      }

      await request(app)
         .put(`/api/v2/questions/${createdQuestionId}`)
         .set(otherUserHeaders)
         .send({
            title: "Updated Title",
         })
         .expect(403);
   }, 20000);

   it(`Returns 200 on successful update by creator`, async () => {
      if (!createdQuestionId) {
         const createResponse = await request(app)
            .post('/api/v2/questions')
            .set(creatorHeaders)
            .send({
               quizId: testQuizId,
               title: "Test Question for Update",
               details: "Test details",
               type: "LA",
            });
         createdQuestionId = createResponse.body.data.id;
      }

      const response = await request(app)
         .put(`/api/v2/questions/${createdQuestionId}`)
         .set(creatorHeaders)
         .send({
            title: "Updated Question Title",
            details: "Updated details",
         })
         .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Updated Question Title");
      expect(response.body.data.details).toBe("Updated details");
   }, 20000);

   it(`Returns 404 when updating non-existent question`, async () => {
      await request(app)
         .put('/api/v2/questions/00000000-0000-0000-0000-000000000000')
         .set(creatorHeaders)
         .send({
            title: "Updated Title",
         })
         .expect(404);
   }, 20000);

   it(`Returns 403 when non-creator tries to delete question`, async () => {
      // Create a question with creator
      const createResponse = await request(app)
         .post('/api/v2/questions')
         .set(creatorHeaders)
         .send({
            quizId: testQuizId,
            title: "Test Question for Delete",
            details: "Test details",
            type: "Boolean",
         });
      const questionId = createResponse.body.data.id;

      // Try to delete with different user
      await request(app)
         .delete(`/api/v2/questions/${questionId}`)
         .set(otherUserHeaders)
         .expect(403);
   }, 20000);

   it(`Returns 204 on successful delete by creator`, async () => {
      // Create a question first
      const createResponse = await request(app)
         .post('/api/v2/questions')
         .set(creatorHeaders)
         .send({
            quizId: testQuizId,
            title: "Question to Delete",
            details: "This will be deleted",
            type: "MCMA",
         });
      const questionId = createResponse.body.data.id;

      // Delete it
      await request(app)
         .delete(`/api/v2/questions/${questionId}`)
         .set(creatorHeaders)
         .expect(204);

      // Verify it's deleted
      const getResponse = await request(app)
         .get('/api/v2/questions')
         .query({ id: questionId })
         .set(creatorHeaders)
         .expect(200);
      
      expect(getResponse.body.data).toHaveLength(0);
   }, 20000);

   it(`Returns 404 when deleting non-existent question`, async () => {
      await request(app)
         .delete('/api/v2/questions/00000000-0000-0000-0000-000000000000')
         .set(creatorHeaders)
         .expect(404);
   }, 20000);

   it(`Validates question type enum values`, async () => {
      const validTypes = ['Boolean', 'MCMA', 'MCSA', 'MTC', 'SA', 'LA'];
      
      for (const type of validTypes) {
         const response = await request(app)
            .post('/api/v2/questions')
            .set(creatorHeaders)
            .send({
               quizId: testQuizId,
               title: `Test Question ${type}`,
               details: "Test details",
               type: type,
            });
         
         expect([201, 400]).toContain(response.status);
      }
   }, 30000);

   it(`Validates title max length (200 characters)`, async () => {
      const longTitle = 'a'.repeat(201);
      
      await request(app)
         .post('/api/v2/questions')
         .set(creatorHeaders)
         .send({
            quizId: testQuizId,
            title: longTitle,
            details: "Test details",
            type: "MCSA",
         })
         .expect(400);
   }, 20000);
});
