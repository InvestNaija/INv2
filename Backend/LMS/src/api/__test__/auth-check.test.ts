import request from "supertest";
import { app } from "../../app";

describe('Authentication Checks', () => {
   const getHeaders = () => ({
      "authorization": `Bearer ${global.getJWTAuth('CUSTOMER')}`,
   });

   describe('Protected Routes', () => {
      it('returns 401 when accessing protected LMS route without token', async () => {
         await request(app)
            .post('/api/v2/lms')
            .send({
               "title": "Test",
               "type": "art",
            })
            .expect(401);
      }, 20000);

      it('returns 401 when accessing protected Quiz route without token', async () => {
         await request(app)
            .post('/api/v2/quiz')
            .send({
               "lmsId": "200ab26b-4363-4c2a-ade2-ce97b1145d39",
               "title": "Test Quiz",
            })
            .expect(401);
      }, 20000);

      it('returns 401 with invalid token format', async () => {
         await request(app)
            .post('/api/v2/lms')
            .set({ "authorization": "Bearer invalid.token.here" })
            .send({
               "title": "Test",
               "type": "art",
            })
            .expect(401);
      }, 20000);

      it('returns 401 with malformed authorization header', async () => {
         await request(app)
            .post('/api/v2/lms')
            .set({ "authorization": "NotBearer sometoken" })
            .send({
               "title": "Test",
               "type": "art",
            })
            .expect(401);
      }, 20000);
   });

   describe('Public Routes', () => {
      it('returns 200 for LMS health check without authentication', async () => {
         await request(app)
            .get('/api/v2/lms/healthz')
            .expect(200);
      }, 20000);

      it('returns 200 for Quiz health check without authentication', async () => {
         await request(app)
            .get('/api/v2/quiz/health')
            .expect(200);
      }, 20000);
   });

   describe('Valid Authentication', () => {
      it('returns success when accessing protected route with valid token', async () => {
         const response = await request(app)
            .get('/api/v2/lms')
            .set(getHeaders())
            .expect(200);
         
         expect(response.body.success).toBe(true);
      }, 20000);

      it('sets currentUser correctly from JWT token', async () => {
         const response = await request(app)
            .post('/api/v2/lms')
            .set(getHeaders())
            .send({
               "title": "Test with Auth",
               "type": "art",
            })
            .expect(201);
         
         // The LMS should be created and associated with the user from the token
         expect(response.body.success).toBe(true);
         expect(response.body.data).toHaveProperty('id');
      }, 20000);
   });
});