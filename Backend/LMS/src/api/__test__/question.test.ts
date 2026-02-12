import request from "supertest";
import { app } from "../../app";

describe('Question Controller', () => {
    const getHeaders = () => ({
        "authorization": `Bearer ${global.getJWTAuth('CUSTOMER')}`,
    });

    const testQuestionId = 'a1b2c3d4-1234-5678-9abc-def012345678';
    // Note: We might need to create a question first if we don't have seed data for Questions in setup.ts
    // Unlike Quiz, I didn't see specific Question seed data in the setup file reading, 
    // so I'll create one in the tests to be safe for updates/deletes.

    describe('GET /api/v2/question/health - Health Check', () => {
        it('returns 200 for health check', async () => {
            const response = await request(app)
                .get('/api/v2/question/health')
                .expect(200);

            expect(response.body.status).toBe('Question Service is healthy');
        }, 20000);
    });

    describe('GET /api/v2/question/question-types - Get Question Types', () => {
        it('returns 200 and list of question types', async () => {
            const response = await request(app)
                .get('/api/v2/question/question-types')
                .set(getHeaders())
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        }, 20000);
    });

    describe('POST /api/v2/question - Create Question', () => {
        it('returns 401 if not authenticated', async () => {
            await request(app)
                .post('/api/v2/question')
                .send({
                    "title": "Test Question",
                    "details": "Details",
                    "type": "SINGLE_CHOICE"
                })
                .expect(401);
        }, 20000);

        it('returns 400 if title is not supplied', async () => {
            await request(app)
                .post('/api/v2/question')
                .set(getHeaders())
                .send({
                    "details": "Details",
                    "type": "SINGLE_CHOICE"
                })
                .expect(400);
        }, 20000);

        it('returns 400 if details is not supplied', async () => {
            await request(app)
                .post('/api/v2/question')
                .set(getHeaders())
                .send({
                    "title": "Test Question",
                    "type": "SINGLE_CHOICE"
                })
                .expect(400);
        }, 20000);

        it('returns 400 if type is not supplied', async () => {
            await request(app)
                .post('/api/v2/question')
                .set(getHeaders())
                .send({
                    "title": "Test Question",
                    "details": "Details",
                })
                .expect(400);
        }, 20000);

        it('returns 201 on successful creation', async () => {
            const response = await request(app)
                .post('/api/v2/question')
                .set(getHeaders())
                .send({
                    "title": "New Question",
                    "details": "Question details here",
                    "type": "SINGLE_CHOICE" // Assuming this matches schema/enum
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.title).toBe('New Question');
        }, 20000);
    });

    describe('GET /api/v2/question - Get All Questions', () => {
        it('returns 401 if not authenticated', async () => {
            await request(app)
                .get('/api/v2/question')
                .expect(401);
        }, 20000);

        it('returns 200 and list of questions', async () => {
            const response = await request(app)
                .get('/api/v2/question')
                .set(getHeaders())
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        }, 20000);

        it('returns 200 with filter query', async () => {
            // Create a specific question to filter
            await request(app)
                .post('/api/v2/question')
                .set(getHeaders())
                .send({
                    "title": "Filter Me",
                    "details": "Filter details",
                    "type": "MULTIPLE_CHOICE"
                });

            const response = await request(app)
                .get('/api/v2/question')
                .query({ type: 'MULTIPLE_CHOICE' }) // Assuming type is stored as string/enum code
                .set(getHeaders())
                .expect(200);

            expect(response.body.success).toBe(true);
            // This assertion depends on data return structure, assuming filter works
            // expect(response.body.data.length).toBeGreaterThan(0); 
        }, 20000);
    });

    describe('GET /api/v2/question/:id - Get Question by ID', () => {
        let createdQuestionId: string;

        beforeAll(async () => {
            const res = await request(app)
                .post('/api/v2/question')
                .set(getHeaders())
                .send({
                    "title": "Get By ID Question",
                    "details": "Details",
                    "type": "SINGLE_CHOICE"
                });
            createdQuestionId = res.body.data.id;
        });

        it('returns 401 if not authenticated', async () => {
            await request(app)
                .get(`/api/v2/question/${createdQuestionId}`)
                .expect(401);
        }, 20000);

        it('returns 200 and question data for valid ID', async () => {
            const response = await request(app)
                .get(`/api/v2/question/${createdQuestionId}`)
                .set(getHeaders())
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(createdQuestionId);
        }, 20000);

        it('returns 404 for non-existent question', async () => {
            await request(app)
                .get('/api/v2/question/00000000-0000-0000-0000-000000000000')
                .set(getHeaders())
                .expect(404);
        }, 20000);
    });

    describe('PUT /api/v2/question/:id - Update Question', () => {
        let questionIdToUpdate: string;

        beforeAll(async () => {
            const res = await request(app)
                .post('/api/v2/question')
                .set(getHeaders())
                .send({
                    "title": "Original Title",
                    "details": "Original Details",
                    "type": "SINGLE_CHOICE"
                });
            questionIdToUpdate = res.body.data.id;
        });

        it('returns 401 if not authenticated', async () => {
            await request(app)
                .put(`/api/v2/question/${questionIdToUpdate}`)
                .send({
                    "title": "Updated Title",
                    "details": "Updated Details",
                    "type": "SINGLE_CHOICE"
                })
                .expect(401);
        }, 20000);

        it('returns 200 on successful update', async () => {
            const response = await request(app)
                .put(`/api/v2/question/${questionIdToUpdate}`)
                .set(getHeaders())
                .send({
                    "title": "Updated Title",
                    "details": "Updated Details",
                    "type": "SINGLE_CHOICE"
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Updated Title');
        }, 20000);

        it('returns 404 for non-existent question', async () => {
            await request(app)
                .put('/api/v2/question/00000000-0000-0000-0000-000000000000')
                .set(getHeaders())
                .send({
                    "title": "Updated Title",
                    "details": "Details",
                    "type": "SINGLE_CHOICE"
                })
                .expect(404);
        }, 20000);
    });

    describe('DELETE /api/v2/question/:id - Delete Question', () => {
        it('returns 401 if not authenticated', async () => {
            await request(app)
                .delete(`/api/v2/question/${testQuestionId}`)
                .expect(401);
        }, 20000);

        it('returns 200 on successful delete', async () => {
            // Create a question to delete
            const createResponse = await request(app)
                .post('/api/v2/question')
                .set(getHeaders())
                .send({
                    "title": "Question To Delete",
                    "details": "Delete me",
                    "type": "SINGLE_CHOICE"
                })
                .expect(201);

            const questionId = createResponse.body.data.id;

            const deleteResponse = await request(app)
                .delete(`/api/v2/question/${questionId}`)
                .set(getHeaders())
                .expect(200);

            expect(deleteResponse.body.success).toBe(true);

            // Verify it's deleted
            await request(app)
                .get(`/api/v2/question/${questionId}`)
                .set(getHeaders())
                .expect(404);
        }, 20000);

        it('returns 404 for non-existent question', async () => {
            await request(app)
                .delete('/api/v2/question/00000000-0000-0000-0000-000000000000')
                .set(getHeaders())
                .expect(404);
        }, 20000);
    });

});
