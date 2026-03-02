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

const quizId = "11b26b00-4363-4c2a-ade2-ce97b1145d39";
const questionId = "22b26b00-4363-4c2a-ade2-ce97b1145d39";
const quizQuestionId = "33b26b00-4363-4c2a-ade2-ce97b1145d39";

describe('QuizQuestion CRUD Integration Tests', () => {

    describe('POST /api/v2/quiz-questions', () => {
        it('Returns 401 if not authenticated', async () => {
            await request(app)
                .post('/api/v2/quiz-questions')
                .send({
                    quizId,
                    questionId,
                    passScore: 10,
                    failScore: 0,
                    order: 1
                })
                .expect(401);
        }, 20000);

        it('Returns 400 if required params are not supplied for creation', async () => {
            await request(app)
                .post('/api/v2/quiz-questions')
                .set(providerHeaders)
                .send({
                    passScore: 10,
                })
                .expect(400);
        }, 20000);

        it('Returns 404 for valid payload but non-existent parent records', async () => {
            const res = await request(app)
                .post('/api/v2/quiz-questions')
                .set(providerHeaders)
                .send({
                    quizId: "00000000-0000-0000-0000-000000000000",
                    questionId: "00000000-0000-0000-0000-000000000000",
                    passScore: 10,
                    failScore: 5,
                    order: 1
                });
            expect(res.status).toBe(404);
        }, 20000);

        it('Returns 403 if user is just a CUSTOMER and not a PROVIDER/TENANT_ADMIN/SUPER_ADMIN', async () => {
            const res = await request(app)
                .post('/api/v2/quiz-questions')
                .set(customerHeaders)
                .send({
                    quizId,
                    questionId,
                    passScore: 10,
                    failScore: 5,
                    order: 1
                });
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("Only PROVIDER or SUPER_ADMIN can add a question to a quiz");
        }, 20000);

        it('Returns 201 on successful create if PROVIDER', async () => {
            const res = await request(app)
                .post('/api/v2/quiz-questions')
                .set(providerHeaders)
                .send({
                    quizId,
                    questionId,
                    passScore: 10,
                    failScore: 5,
                    order: 1
                });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.quizId).toBe(quizId);
            expect(res.body.data.questionId).toBe(questionId);
            expect(res.body.data.passScrore).toBe(10); // Check mappings map fields gracefully
        }, 20000);
    });

    describe('GET /api/v2/quiz-questions', () => {
        it('Returns 200 on successful GET requests for all', async () => {
            const res = await request(app)
                .get('/api/v2/quiz-questions')
                .set(customerHeaders)
                .expect(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
        }, 20000);

        it('Returns 200 on successful GET by query parent ID', async () => {
            const res = await request(app)
                .get('/api/v2/quiz-questions')
                .query({ quizId: quizId })
                .set(customerHeaders)
                .expect(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
        }, 20000);
    });

    describe('PUT /api/v2/quiz-questions/:id', () => {
        it('Returns 400 when updating with invalid types', async () => {
            await request(app)
                .put('/api/v2/quiz-questions/' + quizQuestionId)
                .set(providerHeaders)
                .send({
                    passScore: "string-instead-of-number",
                })
                .expect(400);
        }, 20000);

        it('Returns 404 for Updating a non-existent mapping', async () => {
            await request(app)
                .put('/api/v2/quiz-questions/00000000-0000-0000-0000-000000000000')
                .set(providerHeaders)
                .send({
                    order: 2,
                })
                .expect(404);
        }, 20000);

        it('Returns 403 for Updating a mapping not owned by the user', async () => {
            await request(app)
                .put('/api/v2/quiz-questions/' + quizQuestionId)
                .set(customerHeaders)
                .send({
                    passScore: 100,
                })
                .expect(403);
        }, 20000);

        it('Returns 200 on successful UPDATE', async () => {
            const res = await request(app)
                .put('/api/v2/quiz-questions/' + quizQuestionId)
                .set(providerHeaders)
                .send({
                    passScore: 99,
                    order: 5
                });
            expect(res.status).toBe(200);
            expect(res.body.data.passScrore).toBe(99);
            expect(res.body.data.order).toBe(5);
        }, 20000);
    });

    describe('DELETE /api/v2/quiz-questions/:id', () => {
        it('Returns 404 for Deleting a non-existent mapping', async () => {
            await request(app)
                .delete('/api/v2/quiz-questions/00000000-0000-0000-0000-000000000000')
                .set(providerHeaders)
                .expect(404);
        }, 20000);

        it('Returns 403 for Deleting a mapping not owned by the user', async () => {
            await request(app)
                .delete('/api/v2/quiz-questions/' + quizQuestionId)
                .set(customerHeaders)
                .expect(403);
        }, 20000);

        it('Returns 204 on successful DELETE', async () => {
            await request(app)
                .delete('/api/v2/quiz-questions/' + quizQuestionId)
                .set(providerHeaders)
                .expect(204);

            const res = await request(app)
                .get('/api/v2/quiz-questions')
                .query({ id: quizQuestionId })
                .set(customerHeaders)
                .expect(200);

            expect(res.body.data.length).toBe(0);
        }, 20000);
    });
});
