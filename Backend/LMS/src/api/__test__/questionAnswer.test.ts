import request from "supertest";
import { app } from "../../app";

const providerHeaders = {
    "authorization": global.getJWTAuth('PROVIDER'),
};

const superAdminHeaders = {
    "authorization": global.getJWTAuth('SUPER_ADMIN'),
};

const customerHeaders = {
    "authorization": global.getJWTAuth('CUSTOMER'),
};

const questionId = "22b26b00-4363-4c2a-ade2-ce97b1145d39";
const questionAnswerId = "44b26b00-4363-4c2a-ade2-ce97b1145d39";

describe('QuestionAnswer CRUD Integration Tests', () => {

    describe('POST /api/v2/question-answers', () => {
        it('Returns 401 if not authenticated', async () => {
            await request(app)
                .post('/api/v2/question-answers')
                .send({
                    questionId,
                    answer: "A new answer",
                    isValid: true
                })
                .expect(401);
        }, 20000);

        it('Returns 400 if required params are not supplied for creation', async () => {
            await request(app)
                .post('/api/v2/question-answers')
                .set(providerHeaders)
                .send({
                    answer: "No questionId provided",
                    isValid: false
                })
                .expect(400);
        }, 20000);

        it('Returns 404 for valid payload but non-existent parent records', async () => {
            const res = await request(app)
                .post('/api/v2/question-answers')
                .set(providerHeaders)
                .send({
                    questionId: "00000000-0000-0000-0000-000000000000",
                    answer: "Answer for nothing",
                    isValid: true
                });
            expect(res.status).toBe(404);
        }, 20000);

        it('Returns 403 if user is just a CUSTOMER and not a PROVIDER/TENANT_ADMIN/SUPER_ADMIN', async () => {
            const res = await request(app)
                .post('/api/v2/question-answers')
                .set(customerHeaders)
                .send({
                    questionId,
                    answer: "Customer trying to answer",
                    isValid: true
                });
            expect(res.status).toBe(403);
        }, 20000);

        it('Returns 201 on successful create if PROVIDER', async () => {
            const res = await request(app)
                .post('/api/v2/question-answers')
                .set(providerHeaders)
                .send({
                    questionId,
                    answer: "A valid standard answer",
                    details: "Extra details",
                    isValid: true
                });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.questionId).toBe(questionId);
            expect(res.body.data.answer).toBe("A valid standard answer");
        }, 20000);
    });

    describe('GET /api/v2/question-answers', () => {
        it('Returns 200 on successful GET requests for all', async () => {
            const res = await request(app)
                .get('/api/v2/question-answers')
                .set(customerHeaders)
                .expect(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
        }, 20000);

        it('Returns 200 on successful GET by query parent ID', async () => {
            const res = await request(app)
                .get('/api/v2/question-answers')
                .query({ questionId })
                .set(customerHeaders)
                .expect(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
        }, 20000);
    });

    describe('PUT /api/v2/question-answers/:id', () => {
        it('Returns 400 when updating with invalid types', async () => {
            await request(app)
                .put('/api/v2/question-answers/' + questionAnswerId)
                .set(providerHeaders)
                .send({
                    isValid: "string-instead-of-boolean",
                })
                .expect(400);
        }, 20000);

        it('Returns 404 for Updating a non-existent mapping', async () => {
            await request(app)
                .put('/api/v2/question-answers/00000000-0000-0000-0000-000000000000')
                .set(providerHeaders)
                .send({
                    isValid: false,
                })
                .expect(404);
        }, 20000);

        it('Returns 403 for Updating a mapping entirely as CUSTOMER', async () => {
            await request(app)
                .put('/api/v2/question-answers/' + questionAnswerId)
                .set(customerHeaders)
                .send({
                    answer: "Customer trying to update",
                })
                .expect(403);
        }, 20000);

        it('Returns 200 on successful UPDATE', async () => {
            const res = await request(app)
                .put('/api/v2/question-answers/' + questionAnswerId)
                .set(providerHeaders)
                .send({
                    answer: "Updated answer",
                    isValid: false
                });
            expect(res.status).toBe(200);
            expect(res.body.data.answer).toBe("Updated answer");
            expect(res.body.data.isValid).toBe(false);
        }, 20000);
    });

    describe('DELETE /api/v2/question-answers/:id', () => {
        it('Returns 404 for Deleting a non-existent mapping', async () => {
            await request(app)
                .delete('/api/v2/question-answers/00000000-0000-0000-0000-000000000000')
                .set(providerHeaders)
                .expect(404);
        }, 20000);

        it('Returns 403 for Deleting a mapping as CUSTOMER', async () => {
            await request(app)
                .delete('/api/v2/question-answers/' + questionAnswerId)
                .set(customerHeaders)
                .expect(403);
        }, 20000);

        it('Returns 204 on successful DELETE', async () => {
            await request(app)
                .delete('/api/v2/question-answers/' + questionAnswerId)
                .set(providerHeaders)
                .expect(204);

            const res = await request(app)
                .get('/api/v2/question-answers')
                .query({ id: questionAnswerId })
                .set(customerHeaders)
                .expect(200);

            expect(res.body.data.length).toBe(0);
        }, 20000);
    });
});
