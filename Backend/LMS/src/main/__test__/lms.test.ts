import request from "supertest";
import { app } from "../../app";

const headers = {
   "authorization": global.getJWTAuth('CUSTOMER'),
};

it(`Returns 400 if required params are not supplied`, async () => {
   await request(app)
      .post('/api/v2/lms')
      .set(headers)
      .send({
         "type": "Podcast",
      })
      .expect(400);
   await request(app)
      .post('/api/v2/lms')
      .set(headers)
      .send({
         "title": "goofy",
      })
      .expect(400);
}, 20000);

it(`Returns 200 on successful creation with parent ID`, async () => {
   await request(app)
      .post('/api/v2/lms')
      .set(headers)
      .send({
         "title": "ne dey kdy",
         "type": "pod",
         "pId": "8f72d5a3-4c71-401e-acba-05e5bac5c94c",
      })
      .expect(200);
}, 20000);

it(`Returns 200 on successful creation without parent ID`, async () => {
   await request(app)
      .post('/api/v2/lms')
      .set(headers)
      .send({   
         "title": "grooidy",
         "type": "art",
      })
      .expect(200);
}, 20000);


it(`Returns 200 on successful GET`, async () => {
   await request(app)
      .get('/api/v2/lms')
      .set(headers)
      .expect(200);
}, 20000);


it(`Returns 200 on successful GET by ID`, async () => {
   await request(app)
      .get('/api/v2/lms')
      .query({id: '30b26b-4363-4c2a-ade2-ce97b1145d39'})
      .set(headers)
      .expect(200);
}, 20000);


it(`Returns 200 on successful delete`, async () => {
   await request(app)
      .delete('/api/v2/lms/30b26b-4363-4c2a-ade2-ce97b1145d39')
      .set(headers)
      .expect(200);
}, 20000);


it(`Returns 200 on successful update`, async () => {
   await request(app)
      .patch('/api/v2/lms/200ab26b-4363-4c2a-ade2-ce97b1145d39')
      .set(headers)
      .send({   
         "title": "grooidy",
         "type": "Podcast",
      })
      .expect(200);
}, 20000);