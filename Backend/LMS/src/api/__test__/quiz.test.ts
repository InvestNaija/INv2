import request from "supertest";
import { app } from "../../app";

describe('Quiz Controller', () => {
   const getHeaders = () => ({
      "authorization": `Bearer ${global.getJWTAuth('CUSTOMER')}`,
   });

   // Test LMS ID from seed data
   const testLmsId = '200ab26b-4363-4c2a-ade2-ce97b1145d39';
   const testQuizId = 'a1b2c3d4-1234-5678-9abc-def012345678';
   const testQuizId2 = 'b2c3d4e5-2345-6789-abcd-ef0123456789';

   describe('GET /api/v2/quiz/health - Health Check', () => {
      it('returns 200 for health check', async () => {
         const response = await request(app)
            .get('/api/v2/quiz/health')
            .expect(200);
         
         expect(response.body.status).toBe('Quiz Service is healthy');
      }, 20000);
   });

   describe('POST /api/v2/quiz - Create Quiz', () => {
      it('returns 401 if not authenticated', async () => {
         await request(app)
            .post('/api/v2/quiz')
            .send({
               "lmsId": testLmsId,
               "title": "Test Quiz",
            })
            .expect(401);
      }, 20000);

      it('returns 400 if lmsId is not supplied', async () => {
         await request(app)
            .post('/api/v2/quiz')
            .set(getHeaders())
            .send({
               "title": "Test Quiz",
            })
            .expect(400);
      }, 20000);

      it('returns 400 if title is not supplied', async () => {
         await request(app)
            .post('/api/v2/quiz')
            .set(getHeaders())
            .send({
               "lmsId": testLmsId,
            })
            .expect(400);
      }, 20000);

      it('returns 400 if lmsId is not a valid UUID', async () => {
         await request(app)
            .post('/api/v2/quiz')
            .set(getHeaders())
            .send({
               "lmsId": "invalid-uuid",
               "title": "Test Quiz",
            })
            .expect(400);
      }, 20000);

      it('returns 201 on successful creation with required fields only', async () => {
         const response = await request(app)
            .post('/api/v2/quiz')
            .set(getHeaders())
            .send({
               "lmsId": testLmsId,
               "title": "New Quiz",
            })
            .expect(201);
         
         expect(response.body.success).toBe(true);
         expect(response.body.data).toHaveProperty('id');
         expect(response.body.data.title).toBe('New Quiz');
         expect(response.body.data.lmsId).toBe(testLmsId);
      }, 20000);

      it('returns 201 on successful creation with all fields', async () => {
         const response = await request(app)
            .post('/api/v2/quiz')
            .set(getHeaders())
            .send({
               "lmsId": testLmsId,
               "title": "Complete Quiz",
               "detail": "A comprehensive quiz with all fields",
               "startDate": "2026-01-22",
               "endDate": "2026-12-31",
               "isImmediateAnswer": true,
            })
            .expect(201);
         
         expect(response.body.success).toBe(true);
         expect(response.body.data).toHaveProperty('id');
         expect(response.body.data.title).toBe('Complete Quiz');
         expect(response.body.data.detail).toBe('A comprehensive quiz with all fields');
         expect(response.body.data.isImmediateAnswer).toBe(true);
      }, 20000);

      it('returns 201 with ISO date format', async () => {
         const response = await request(app)
            .post('/api/v2/quiz')
            .set(getHeaders())
            .send({
               "lmsId": testLmsId,
               "title": "Quiz with ISO Dates",
               "startDate": "2026-03-15T09:00:00.000Z",
               "endDate": "2026-06-15T17:00:00.000Z",
            })
            .expect(201);
         
         expect(response.body.success).toBe(true);
         expect(response.body.data).toHaveProperty('startDate');
         expect(response.body.data).toHaveProperty('endDate');
      }, 20000);
   });

   describe('GET /api/v2/quiz - Get All Quizzes', () => {
      it('returns 401 if not authenticated', async () => {
         await request(app)
            .get('/api/v2/quiz')
            .expect(401);
      }, 20000);

      it('returns 200 and list of quizzes', async () => {
         const response = await request(app)
            .get('/api/v2/quiz')
            .set(getHeaders())
            .expect(200);
         
         expect(response.body.success).toBe(true);
         expect(Array.isArray(response.body.data)).toBe(true);
      }, 20000);

      it('returns 200 with filter query', async () => {
         const response = await request(app)
            .get('/api/v2/quiz')
            .query({ lmsId: testLmsId })
            .set(getHeaders())
            .expect(200);
         
         expect(response.body.success).toBe(true);
         expect(Array.isArray(response.body.data)).toBe(true);
      }, 20000);
   });

   describe('GET /api/v2/quiz/:id - Get Quiz by ID', () => {
      it('returns 401 if not authenticated', async () => {
         await request(app)
            .get(`/api/v2/quiz/${testQuizId}`)
            .expect(401);
      }, 20000);

      it('returns 200 and quiz data for valid ID', async () => {
         const response = await request(app)
            .get(`/api/v2/quiz/${testQuizId}`)
            .set(getHeaders())
            .expect(200);
         
         expect(response.body.success).toBe(true);
         expect(response.body.data).toHaveProperty('id');
         expect(response.body.data.id).toBe(testQuizId);
      }, 20000);

      it('returns 404 for non-existent quiz', async () => {
         await request(app)
            .get('/api/v2/quiz/00000000-0000-0000-0000-000000000000')
            .set(getHeaders())
            .expect(404);
      }, 20000);
   });

   describe('PUT /api/v2/quiz/:id - Update Quiz', () => {
      it('returns 401 if not authenticated', async () => {
         await request(app)
            .put(`/api/v2/quiz/${testQuizId2}`)
            .send({
               "title": "Updated Quiz Title",
            })
            .expect(401);
      }, 20000);

      it('returns 200 on successful update', async () => {
         const response = await request(app)
            .put(`/api/v2/quiz/${testQuizId2}`)
            .set(getHeaders())
            .send({
               "title": "Updated Quiz Title",
               "detail": "Updated description",
            })
            .expect(200);
         
         expect(response.body.success).toBe(true);
         expect(response.body.data.title).toBe('Updated Quiz Title');
      }, 20000);

      it('returns 200 when updating dates', async () => {
         const response = await request(app)
            .put(`/api/v2/quiz/${testQuizId2}`)
            .set(getHeaders())
            .send({
               "startDate": "2026-04-01",
               "endDate": "2026-08-31",
               "isImmediateAnswer": true,
            })
            .expect(200);
         
         expect(response.body.success).toBe(true);
      }, 20000);

      it('returns 404 for non-existent quiz', async () => {
         await request(app)
            .put('/api/v2/quiz/00000000-0000-0000-0000-000000000000')
            .set(getHeaders())
            .send({
               "title": "Updated Title",
            })
            .expect(404);
      }, 20000);
   });

   describe('DELETE /api/v2/quiz/:id - Delete Quiz', () => {
      it('returns 401 if not authenticated', async () => {
         await request(app)
            .delete(`/api/v2/quiz/${testQuizId}`)
            .expect(401);
      }, 20000);

      it('returns 200 on successful delete', async () => {
         // First create a quiz to delete
         const createResponse = await request(app)
            .post('/api/v2/quiz')
            .set(getHeaders())
            .send({
               "lmsId": testLmsId,
               "title": "Quiz To Delete",
            })
            .expect(201);
         
         const quizId = createResponse.body.data.id;
         
         const deleteResponse = await request(app)
            .delete(`/api/v2/quiz/${quizId}`)
            .set(getHeaders())
            .expect(200);
         
         expect(deleteResponse.body.success).toBe(true);
         
         // Verify it's deleted
         await request(app)
            .get(`/api/v2/quiz/${quizId}`)
            .set(getHeaders())
            .expect(404);
      }, 20000);

      it('returns 404 for non-existent quiz', async () => {
         await request(app)
            .delete('/api/v2/quiz/00000000-0000-0000-0000-000000000000')
            .set(getHeaders())
            .expect(404);
      }, 20000);
   });

   describe('Quiz Validation Edge Cases', () => {
      it('accepts empty string for optional detail field', async () => {
         const response = await request(app)
            .post('/api/v2/quiz')
            .set(getHeaders())
            .send({
               "lmsId": testLmsId,
               "title": "Quiz with empty detail",
               "detail": "",
            })
            .expect(201);
         
         expect(response.body.success).toBe(true);
      }, 20000);

      it('accepts boolean false for isImmediateAnswer', async () => {
         const response = await request(app)
            .post('/api/v2/quiz')
            .set(getHeaders())
            .send({
               "lmsId": testLmsId,
               "title": "Quiz with false immediate answer",
               "isImmediateAnswer": false,
            })
            .expect(201);
         
         expect(response.body.success).toBe(true);
         expect(response.body.data.isImmediateAnswer).toBe(false);
      }, 20000);
   });
});
