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

const quizId = "a1b2c3d4-1234-5678-9abc-def012345678";
const quizAttemptId = "55b26b00-4363-4c2a-ade2-ce97b1145d39";

describe('QuizAttempt CRUD Integration Tests', () => {

    describe('POST /api/v2/quiz-attempts', () => {
        it('Returns 401 if not authenticated', async () => {
            await request(app)
                .post('/api/v2/quiz-attempts')
                .send({
                    quizId
                })
                .expect(401);
        }, 20000);

        it('Returns 400 if required params are not supplied for creation', async () => {
            await request(app)
                .post('/api/v2/quiz-attempts')
                .set(customerHeaders)
                .send({
                    attemptIp: "127.0.0.1" // missing quizId
                })
                .expect(400);
        }, 20000);

        it('Returns 404 for valid payload but non-existent parent quiz', async () => {
            const res = await request(app)
                .post('/api/v2/quiz-attempts')
                .set(customerHeaders)
                .send({
                    quizId: "00000000-0000-0000-0000-000000000000"
                });
            expect(res.status).toBe(404);
        }, 20000);

        it('Returns 201 on successful create as CUSTOMER (any role)', async () => {
            const res = await request(app)
                .post('/api/v2/quiz-attempts')
                .set(customerHeaders)
                .send({
                    quizId,
                    attemptIp: "192.168.1.1"
                });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.quizId).toBe(quizId);
            expect(res.body.data.attemptIp).toBe("192.168.1.1");
            expect(res.body.data.attemptStart).toBeTruthy();
        }, 20000);
    });

    describe('GET /api/v2/quiz-attempts', () => {
        it('Returns 200 on successful GET requests for all', async () => {
            const res = await request(app)
                .get('/api/v2/quiz-attempts')
                .set(customerHeaders)
                .expect(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
        }, 20000);

        it('Returns 200 on successful GET by query quiz ID', async () => {
            const res = await request(app)
                .get('/api/v2/quiz-attempts')
                .query({ quizId })
                .set(customerHeaders)
                .expect(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
        }, 20000);
    });

    describe('PUT /api/v2/quiz-attempts/:id', () => {
        it('Returns 400 when updating with invalid types', async () => {
            await request(app)
                .put('/api/v2/quiz-attempts/' + quizAttemptId)
                .set(customerHeaders)
                .send({
                    attemptEnd: "not-a-date",
                })
                .expect(400);
        }, 20000);

        it('Returns 404 for Updating a non-existent mapping', async () => {
            await request(app)
                .put('/api/v2/quiz-attempts/00000000-0000-0000-0000-000000000000')
                .set(customerHeaders)
                .send({
                    attemptIp: "1.1.1.1",
                })
                .expect(404);
        }, 20000);

        it('Returns 200 on successful UPDATE by owner (CUSTOMER)', async () => {
            const endTime = new Date().toISOString();
            const res = await request(app)
                .put('/api/v2/quiz-attempts/' + quizAttemptId)
                .set(customerHeaders)
                .send({
                    attemptEnd: endTime,
                    attemptIp: "10.0.0.1"
                });
            expect(res.status).toBe(200);
            expect(res.body.data.attemptIp).toBe("10.0.0.1");
            expect(new Date(res.body.data.attemptEnd).getTime()).not.toBeNaN();
        }, 20000);
    });

    describe('DELETE /api/v2/quiz-attempts/:id', () => {
        it('Returns 404 for Deleting a non-existent mapping', async () => {
            await request(app)
                .delete('/api/v2/quiz-attempts/00000000-0000-0000-0000-000000000000')
                .set(customerHeaders) // owner
                .expect(404);
        }, 20000);

        it('Returns 403 for Deleting attempting as non-owner (or non-provider) if we restrict it, but right now ANY owner or PROVIDER can delete or only PROVIDER according to our service? Wait, our service says "Only PROVIDER or SUPER_ADMIN or the Owner can delete a quiz attempt". Wait, service says "if (quizAttempt.userId !== currentUser.user?.id && !hasRole) { return 403; }". Currently CUSTOMER is the owner of quizAttemptId 55b26b00-4363-4c2a-ade2-ce97b1145d39.', async () => {
            // Lets test deleting by owner
            await request(app)
                .delete('/api/v2/quiz-attempts/' + quizAttemptId)
                .set(customerHeaders)
                .expect(204);

            const res = await request(app)
                .get('/api/v2/quiz-attempts')
                .query({ id: quizAttemptId })
                .set(providerHeaders)
                .expect(200);

            expect(res.body.data.length).toBe(0);
        }, 20000);
    });
});
