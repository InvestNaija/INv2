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

const attemptAnswerId = "66b26b00-4363-4c2a-ade2-ce97b1145d39";
const quizAttemptId = "55b26b00-4363-4c2a-ade2-ce97b1145d39";
const questionId = "22b26b00-4363-4c2a-ade2-ce97b1145d39";

describe('AttemptAnswer CRUD Integration Tests', () => {

    describe('POST /api/v2/attempt-answers', () => {
        it('Returns 401 if not authenticated', async () => {
            await request(app)
                .post('/api/v2/attempt-answers')
                .send({
                    quizAttemptId,
                    questionId,
                    answerGiven: "Option C",
                    answerScore: 0
                })
                .expect(401);
        }, 20000);

        it('Returns 400 if required params are missing', async () => {
            await request(app)
                .post('/api/v2/attempt-answers')
                .set(customerHeaders)
                .send({
                    quizAttemptId,
                    answerGiven: "Option C",
                })
                .expect(400);
        }, 20000);

        it('Returns 201 on successful submission by any logged-in user', async () => {
            const res = await request(app)
                .post('/api/v2/attempt-answers')
                .set(customerHeaders)
                .send({
                    quizAttemptId,
                    questionId,
                    answerGiven: "My final answer",
                    answerScore: 10
                });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.quizAttemptId).toBe(quizAttemptId);
            expect(res.body.data.answerGiven).toBe("My final answer");
            expect(res.body.data.answerScore).toBe(10);
        }, 20000);
    });

    describe('GET /api/v2/attempt-answers', () => {
        it('Returns 200 on successful GET requests', async () => {
            const res = await request(app)
                .get('/api/v2/attempt-answers')
                .set(customerHeaders)
                .expect(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
        }, 20000);

        it('Returns 200 on successful GET by query quizAttempt ID', async () => {
            const res = await request(app)
                .get('/api/v2/attempt-answers')
                .query({ quizAttemptId })
                .set(customerHeaders)
                .expect(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
        }, 20000);
    });

    describe('PUT /api/v2/attempt-answers/:id', () => {
        it('Returns 400 when updating with invalid types', async () => {
            await request(app)
                .put('/api/v2/attempt-answers/' + attemptAnswerId)
                .set(customerHeaders)
                .send({
                    answerScore: "not-a-number",
                })
                .expect(400);
        }, 20000);

        it('Returns 404 for Updating a non-existent mapping', async () => {
            await request(app)
                .put('/api/v2/attempt-answers/00000000-0000-0000-0000-000000000000')
                .set(customerHeaders)
                .send({
                    answerGiven: "New answer",
                })
                .expect(404);
        }, 20000);

        it('Returns 200 on successful UPDATE', async () => {
            const res = await request(app)
                .put('/api/v2/attempt-answers/' + attemptAnswerId)
                .set(customerHeaders)
                .send({
                    answerGiven: "Actually, option B",
                    answerScore: 5
                });
            expect(res.status).toBe(200);
            expect(res.body.data.answerGiven).toBe("Actually, option B");
            expect(res.body.data.answerScore).toBe(5);
        }, 20000);
    });

    describe('DELETE /api/v2/attempt-answers/:id', () => {
        it('Returns 404 for Deleting a non-existent answer', async () => {
            await request(app)
                .delete('/api/v2/attempt-answers/00000000-0000-0000-0000-000000000000')
                .set(providerHeaders)
                .expect(404);
        }, 20000);

        it('Returns 403 for Deleting an answer as non-admin CUSTOMER', async () => {
            await request(app)
                .delete('/api/v2/attempt-answers/' + attemptAnswerId)
                .set(customerHeaders)
                .expect(403);
        }, 20000);

        it('Returns 204 on successful DELETE by PROVIDER/Admin', async () => {
            await request(app)
                .delete('/api/v2/attempt-answers/' + attemptAnswerId)
                .set(providerHeaders)
                .expect(204);

            const res = await request(app)
                .get('/api/v2/attempt-answers')
                .query({ id: attemptAnswerId })
                .set(providerHeaders)
                .expect(200);

            expect(res.body.data.length).toBe(0);
        }, 20000);
    });
});
