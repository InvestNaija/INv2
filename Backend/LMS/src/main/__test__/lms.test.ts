import request from "supertest";
import { app } from "../../app";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZTI4OGRiODktMGJmYi00ZDAyLWI3YTAtZTRhM2U3ZGMwNmQ2IiwiYnZuIjpudWxsLCJmaXJzdE5hbWUiOiJva2VlZSIsImxhc3ROYW1lIjoiaWtpcyIsImZpcnN0TG9naW4iOmZhbHNlLCJ1dWlkVG9rZW4iOiJWWDc3N09CTlg1WVAyLU5FOURDNDFMQTUwQjkzQ1JSTCIsImlzRW5hYmxlZCI6dHJ1ZSwiaXNMb2NrZWQiOmZhbHNlLCJ2ZXJzaW9uIjozLCJ1cGRhdGVkQXQiOiIyMDI1LTAyLTIxVDA4OjI0OjQxLjUzOVoifSwiVGVuYW50IjpbeyJpZCI6IjI3NGIwODJlLTUyNTctNDk3Yi1hZTEzLTU2ZTMxNTk1NWVlYyIsIm5hbWUiOiJDaGFucGVsIEhpbGwgRGVuaGFtIFNlY3VyaXRpZXMiLCJSb2xlcyI6W3sibmFtZSI6IkNVU1RPTUVSIn1dfV0sImlhdCI6MTc0MDEyNjI4MiwiZXhwIjoxNzQwMTI5ODgyfQ.YXwpiQM6J-8wcpDDliHx3QBaZtrD63ROiQPnd54w2p0";

it(`Returns 400 if required params are not supplied`, async () => {
   await request(app)
      .post('/api/v2/lms')
      .set('Authorization', `Bearer ${token}`)
      .send({
         "type": "Podcast",
      })
      .expect(400);
   await request(app)
      .post('/api/v2/lms')
      .set('Authorization', `Bearer ${token}`)
      .send({
         "title": "goofy",
      })
      .expect(400);
}, 20000);

it(`Returns 200 on successful creation with parent ID`, async () => {
   await request(app)
      .post('/api/v2/lms')
      .set('Authorization', `Bearer ${token}`)
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
      .set('Authorization', `Bearer ${token}`)
      .send({   
         "title": "grooidy",
         "type": "art",
      })
      .expect(200);
}, 20000);


it(`Returns 200 on successful GET`, async () => {
   await request(app)
      .get('/api/v2/lms')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
}, 20000);


it(`Returns 200 on successful GET by ID`, async () => {
   await request(app)
      .get('/api/v2/lms')
      .query({id: '30b26b-4363-4c2a-ade2-ce97b1145d39'})
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
}, 20000);


it(`Returns 200 on successful delete`, async () => {
   await request(app)
      .delete('/api/v2/lms/30b26b-4363-4c2a-ade2-ce97b1145d39')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
}, 20000);


it(`Returns 200 on successful update`, async () => {
   await request(app)
      .patch('/api/v2/lms/200ab26b-4363-4c2a-ade2-ce97b1145d39')
      .set('Authorization', `Bearer ${token}`)
      .send({   
         "title": "grooidy",
         "type": "Podcast",
      })
      .expect(200);
}, 20000);