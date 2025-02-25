import request from "supertest";
import { app } from "../../app";

const headers = {
   "authorization": global.getJWTAuth(),
};
it(`Returns 200 on successful auth check`, async ()=>{
   await request(app)
      .get('/api/v2/customer/saveplan/savein')
      .set(headers)
      .send()
      .expect(200);
}, 20000);