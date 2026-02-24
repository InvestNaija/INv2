import request from "supertest";
import { app } from "../../app";

const headers = {
   "authorization": global.getJWTAuth('CUSTOMER'),
};

it('Creates a new question successfully', async () => {
   const questionData = {
      userId: "087e7b7f-bf68-4d63-907b-9a9374a89420",
      title: "Question Title",
      details: "Question details",
      type: 100
   };

   const response = await request(app)
      .post('/api/v2/questions') 
      .set(headers)
      .send(questionData)
      .expect(201);
   
   expect(response.body.success).toBe(true);
   expect(response.body.code).toBe(201);
   expect(response.body.message).toBe("Record created successfully");

   const createdQuestion = response.body.data;
   expect(createdQuestion).toHaveProperty("id");
   expect(createdQuestion.title).toBe(questionData.title);
   expect(createdQuestion.details).toBe(questionData.details);
   expect(new Date(createdQuestion.createdAt)).not.toBeNaN();
   expect(new Date(createdQuestion.updatedAt)).not.toBeNaN();
}, 20000);

it('Fetches questions successfully', async () => {
   const questionData = {
      userId: "087e7b7f-bf68-4d63-907b-9a9374a89420",
      title: "Question Title",
      details: "Question details",
      type: 100
   };

   await request(app)
      .post('/api/v2/questions') 
      .set(headers)
      .send(questionData)
      .expect(201);

   const response = await request(app)
      .get('/api/v2/questions')
      .set(headers)
      .expect(200);

   expect(response.body.success).toBe(true);
   expect(response.body.code).toBe(200);
   expect(response.body.message).toBe("Records found");
   expect(response.body.data).toBeInstanceOf(Array);
   expect(response.body.data.length).toBeGreaterThan(0);

   const question = response.body.data[0];

   expect(question).toHaveProperty("id");
   expect(question).toHaveProperty("title");
   expect(question).toHaveProperty("details");
   expect(question).toHaveProperty("createdAt");
   expect(question).toHaveProperty("updatedAt");
   expect(question).toHaveProperty("deletedAt", null);
}, 20000);

it('Fetches a question and updates it successfully', async () => {
   const questionData = {
      userId: "087e7b7f-bf68-4d63-907b-9a9374a89420",
      title: "Question Title",
      details: "Question details",
      type: 100
   };

   await request(app)
      .post('/api/v2/questions') 
      .set(headers)
      .send(questionData)
      .expect(201);

   const fetchResponse = await request(app)
      .get('/api/v2/questions')
      .set(headers)
      .expect(200);

   const questions = fetchResponse.body.data;
   expect(questions.length).toBeGreaterThan(0);

   const questionId = questions[0].id;

   const updatedData = {
      title: "Updated Question Title",
      details: "Updated Question Details"
   };

   const updateResponse = await request(app)
      .put(`/api/v2/questions/${questionId}`)
      .set(headers)
      .send(updatedData)
      .expect(200);

   expect(updateResponse.body.success).toBe(true);
   expect(updateResponse.body.code).toBe(200);
   expect(updateResponse.body.message).toBe("Record updated successfully");

   const updatedQuestion = updateResponse.body.data;
   expect(updatedQuestion).toHaveProperty("id", questionId);
   expect(updatedQuestion).toHaveProperty("title", updatedData.title);
   expect(updatedQuestion).toHaveProperty("details", updatedData.details);
   expect(new Date(updatedQuestion.updatedAt)).not.toBeNaN();
}, 20000);

it('Fetches a question and deletes it successfully', async () => {
   const questionData = {
      userId: "087e7b7f-bf68-4d63-907b-9a9374a89420",
      title: "Question Title",
      details: "Question details",
      type: 100
   };

   await request(app)
      .post('/api/v2/questions') 
      .set(headers)
      .send(questionData)
      .expect(201);

   const fetchResponse = await request(app)
      .get('/api/v2/questions')
      .set(headers)
      .expect(200);

   const questions = fetchResponse.body.data;
   expect(questions.length).toBeGreaterThan(0);

   const questionId = questions[0].id;

   const deleteResponse = await request(app)
      .delete(`/api/v2/questions/${questionId}`)
      .set(headers)
      .expect(200); 

   expect(deleteResponse.body.success).toBe(true);
   expect(deleteResponse.body.code).toBe(200);
   expect(deleteResponse.body.message).toBe("Record deleted successfully");

   await request(app)
      .get(`/api/v2/questions/${questionId}`)
      .set(headers)
      .expect(404);
}, 20000);
