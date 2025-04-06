import request from "supertest";
import { app } from "../../app";

const headers = {
   "authorization": global.getJWTAuth('CUSTOMER'),
};

it('Creates a question and uses its ID to create an answer successfully', async () => { 
   const questionPayload = {
      userId: "087e7b7f-bf68-4d63-907b-9a9374a89420",
      title: "Question Title",
      details: "Question details",
      type: 100
   };

   const createQuestionResponse = await request(app)
      .post('/api/v2/questions')
      .set(headers)
      .send(questionPayload)
      .expect(201);

   expect(createQuestionResponse.body.success).toBe(true);
   expect(createQuestionResponse.body.code).toBe(201);
   const createdQuestion = createQuestionResponse.body.data;
   
   const answerPayload = {
      questionId: createdQuestion.id,
      answer: 'Answer',
      detail: "Details about the answer",
      isValid: true
   };

   const createAnswerResponse = await request(app)
      .post('/api/v2/question/answers')
      .set(headers)
      .send(answerPayload)
      .expect(201);

   expect(createAnswerResponse.body.success).toBe(true);
   expect(createAnswerResponse.body.code).toBe(201);
   expect(createAnswerResponse.body.message).toBe("Record created successfully");

   
   const createdAnswer = createAnswerResponse.body.data;
   expect(createdAnswer.questionId).toBe(createdQuestion.id);
   expect(createdAnswer.detail).toBe("Details about the answer");
   expect(createdAnswer.answer).toBe("Answer");
   expect(createdAnswer.isValid).toBe(true);
}, 20000);

it('Creates a question, adds answers, and fetches answers dynamically', async () => {
   const questionPayload = {
      userId: "087e7b7f-bf68-4d63-907b-9a9374a89420",
      title: "Question Title",
      details: "Question details",
      type: 100
   };

   const createQuestionResponse = await request(app)
      .post('/api/v2/questions') 
      .set(headers)
      .send(questionPayload)
      .expect(201);

   const questionId = createQuestionResponse.body.data.id;
   expect(questionId).toBeDefined();
   
   const answerPayload = {
      questionId,
      answer: "Sample answer",
      detail: "Answer details",
      isValid: true,
   };
   
   await request(app)
      .post('/api/v2/question/answers')
      .set(headers)
      .send(answerPayload)
      .expect(201);
   
   const fetchAnswersResponse = await request(app)
      .get(`/api/v2/question/answers`)
      .set(headers)
      .expect(200);
      
   expect(fetchAnswersResponse.body.success).toBe(true);
   expect(fetchAnswersResponse.body.code).toBe(200);
   expect(fetchAnswersResponse.body.message).toBe("Records found");

   const answer = fetchAnswersResponse.body.data[0];
   expect(answer.id).toBeDefined();
   expect(answer.createdAt).toBeDefined(); 
   expect(answer.updatedAt).toBeDefined();
   expect(answer).toHaveProperty("detail");
}, 30000);

it('Fetches a question answer and updates it dynamically', async () => {
   const fetchAnswersResponse = await request(app)
      .get('/api/v2/question/answers')
      .set(headers)
      .expect(200);

   expect(fetchAnswersResponse.body.success).toBe(true);
   expect(fetchAnswersResponse.body.code).toBe(200);
   expect(fetchAnswersResponse.body.message).toBe("Records found");

   const answer = fetchAnswersResponse.body.data[0];

   const answerId = answer.id;
   const questionId = answer.questionId;
   expect(answerId).toBeDefined();
   expect(questionId).toBeDefined();

   const updatePayload = {
      questionId: questionId,
      detail: "Updated details",
   };

   const updateResponse = await request(app)
      .put(`/api/v2/question/answers/${answerId}`)
      .set(headers)
      .send(updatePayload)
      .expect(200);

   expect(updateResponse.body.success).toBe(true);
   expect(updateResponse.body.code).toBe(200);
   expect(updateResponse.body.message).toBe("Record updated successfully");

   const updatedAnswer = updateResponse.body.data;

   expect(updatedAnswer.id).toBe(answerId);
   expect(updatedAnswer.detail).toBe("Updated details");
   expect(updatedAnswer).toHaveProperty("isValid");
}, 30000);

it('Fetches and deletes a question answer dynamically', async () => {
   const fetchAnswersResponse = await request(app)
      .get('/api/v2/question/answers')
      .set(headers)
      .expect(200);

   expect(fetchAnswersResponse.body.success).toBe(true);
   expect(fetchAnswersResponse.body.code).toBe(200);
   expect(fetchAnswersResponse.body.message).toBe("Records found");

   const answer = fetchAnswersResponse.body.data[0]; 
   const answerId = answer.id;
   expect(answerId).toBeDefined();

   const deleteResponse = await request(app)
      .delete(`/api/v2/question/answers/${answerId}`)
      .set(headers)
      .expect(200);

   expect(deleteResponse.body.success).toBe(true);
   expect(deleteResponse.body.code).toBe(200);
   expect(deleteResponse.body.message).toBe("Record deleted successfully");
}, 30000);

