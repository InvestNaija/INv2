import request from "supertest";
import { app } from "../../app";

// Example token (replace with a valid token if necessary)
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZWJlNWUxYzQtZTJmZi00NDQxLTk2M2EtZTlhYjA0YjdmOWU4IiwiYnZuIjpudWxsLCJmaXJzdE5hbWUiOiJBYmltYnMiLCJsYXN0TmFtZSI6IkhhbnMiLCJmaXJzdExvZ2luIjpmYWxzZSwidXVpZFRva2VuIjoiRDEzSTFVSzA1NjVQUk1BRVNYMTFRUklYSTNQS0xZMEsiLCJpc0VuYWJsZWQiOnRydWUsImlzTG9ja2VkIjpmYWxzZSwidmVyc2lvbiI6OSwidXBkYXRlZEF0IjoiMjAyNS0wMS0yMFQxNDo1Njo0NS44NzlaIn0sIlRlbmFudCI6W3siaWQiOiIyNzRiMDgyZS01MjU3LTQ5N2ItYWUxMy01NmUzMTU5NTVlZWMiLCJuYW1lIjoiQ2hhbnBlbCBIaWxsIERlbmhhbSBTZWN1cml0aWVzIiwiUm9sZXMiOlt7Im5hbWUiOiJDVVNUT01FUiJ9XX1dLCJpYXQiOjE3MzczODUwMDYsImV4cCI6MTczNzM4ODYwNn0.UmGNe91qS0aLlukvY-MH72HCnPx7Ohab3Fs2_7oJgPg";

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
         "title": "gridy",
      })
      .expect(400);
}, 20000);

it(`Returns 201 on successful creation with parent ID`, async () => {
   await request(app)
      .post('/api/v2/lms')
      .set('Authorization', `Bearer ${token}`)
      .send({
         "title": "grilikdy",
         "type": "Podcast",
         "pId": "8f72d5a3-4c71-401e-acba-05e5bac5c94c",
      })
      .expect(200);
}, 20000);

it(`Returns 201 on successful creation without parent ID`, async () => {
   await request(app)
      .post('/api/v2/lms')
      .set('Authorization', `Bearer ${token}`)
      .send({   
         "title": "grooidy",
         "type": "Podcast",
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
      .query({id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39'})
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
}, 20000);


it(`Returns 200 on successful delete`, async () => {
   await request(app)
      .delete('/api/v2/lms/30e6b26b-4363-4c2a-ade2-ce97b1145d39')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
}, 20000);


it(`Returns 201 on successful update`, async () => {
   await request(app)
      .patch('/api/v2/lms/200ab26b-4363-4c2a-ade2-ce97b1145d39')
      .set('Authorization', `Bearer ${token}`)
      .send({   
         "title": "grooidy",
         "type": "Podcast",
      })
      .expect(200);
}, 20000);