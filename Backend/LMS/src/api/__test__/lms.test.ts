import request from "supertest";
import { app } from "../../app";

describe('LMS Controller', () => {
   const getHeaders = () => ({
      "authorization": `Bearer ${global.getJWTAuth('CUSTOMER')}`,
   });

   describe('POST /api/v2/lms - Create LMS', () => {
      it('returns 401 if not authenticated', async () => {
         await request(app)
            .post('/api/v2/lms')
            .send({
               "title": "Test Course",
               "type": "crs",
            })
            .expect(401);
      }, 20000);

      it('returns 400 if title is not supplied', async () => {
         await request(app)
            .post('/api/v2/lms')
            .set(getHeaders())
            .send({
               "type": "pod",
            })
            .expect(400);
      }, 20000);

      it('returns 400 if type is not supplied', async () => {
         await request(app)
            .post('/api/v2/lms')
            .set(getHeaders())
            .send({
               "title": "Test Title",
            })
            .expect(400);
      }, 20000);

      it('returns 201 on successful creation with parent ID', async () => {
         const response = await request(app)
            .post('/api/v2/lms')
            .set(getHeaders())
            .send({
               "title": "Child Course",
               "type": "pod",
               "pId": "8f72d5a3-4c71-401e-acba-05e5bac5c94c",
            })
            .expect(201);
         
         expect(response.body.success).toBe(true);
         expect(response.body.data).toHaveProperty('id');
         expect(response.body.data.title).toBe('Child Course');
      }, 20000);

      it('returns 201 on successful creation without parent ID', async () => {
         const response = await request(app)
            .post('/api/v2/lms')
            .set(getHeaders())
            .send({   
               "title": "Standalone Article",
               "type": "art",
            })
            .expect(201);
         
         expect(response.body.success).toBe(true);
         expect(response.body.data).toHaveProperty('id');
      }, 20000);

      it('returns 201 with all optional fields', async () => {
         const response = await request(app)
            .post('/api/v2/lms')
            .set(getHeaders())
            .send({   
               "title": "Complete Course",
               "type": "crs",
               "price": "99.99",
               "summary": "A comprehensive course",
               "content": "Full course content here",
            })
            .expect(201);
         
         expect(response.body.success).toBe(true);
         expect(response.body.data.title).toBe('Complete Course');
      }, 20000);
   });

   describe('GET /api/v2/lms - Get LMS entries', () => {
      it('returns 200 and list of LMS entries', async () => {
         const response = await request(app)
            .get('/api/v2/lms')
            .set(getHeaders())
            .expect(200);
         
         expect(response.body.success).toBe(true);
         expect(Array.isArray(response.body.data)).toBe(true);
      }, 20000);

      it('returns 200 with filter query', async () => {
         const response = await request(app)
            .get('/api/v2/lms')
            .query({ id: '30b26b00-4363-4c2a-ade2-ce97b1145d39' })
            .set(getHeaders())
            .expect(200);
         
         expect(response.body.success).toBe(true);
      }, 20000);
   });

   describe('PUT /api/v2/lms/:id - Update LMS', () => {
      it('returns 200 on successful update', async () => {
         const response = await request(app)
            .put('/api/v2/lms/200ab26b-4363-4c2a-ade2-ce97b1145d39')
            .set(getHeaders())
            .send({   
               "title": "Updated Title",
               "summary": "Updated summary",
            })
            .expect(200);
         
         expect(response.body.success).toBe(true);
      }, 20000);

      it('returns 404 for non-existent LMS', async () => {
         await request(app)
            .put('/api/v2/lms/00000000-0000-0000-0000-000000000000')
            .set(getHeaders())
            .send({   
               "title": "Updated Title",
            })
            .expect(404);
      }, 20000);
   });

   describe('DELETE /api/v2/lms/:id - Delete LMS', () => {
      it('returns 200 on successful delete', async () => {
         // First create an LMS to delete
         const createResponse = await request(app)
            .post('/api/v2/lms')
            .set(getHeaders())
            .send({
               "title": "To Be Deleted",
               "type": "art",
            })
            .expect(201);
         
         const lmsId = createResponse.body.data.id;
         
         const deleteResponse = await request(app)
            .delete(`/api/v2/lms/${lmsId}`)
            .set(getHeaders())
            .expect(200);
         
         expect(deleteResponse.body.success).toBe(true);
      }, 20000);

      it('returns 404 for non-existent LMS', async () => {
         await request(app)
            .delete('/api/v2/lms/00000000-0000-0000-0000-000000000000')
            .set(getHeaders())
            .expect(404);
      }, 20000);
   });

   describe('GET /api/v2/lms/healthz - Health Check', () => {
      it('returns 200 for health check', async () => {
         const response = await request(app)
            .get('/api/v2/lms/healthz')
            .expect(200);
         
         expect(response.body.status).toBe(200);
      }, 20000);
   });
});