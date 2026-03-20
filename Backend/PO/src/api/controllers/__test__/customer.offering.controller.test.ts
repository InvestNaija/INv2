import request from "supertest";
import { app } from "../../../app";

const headers = {
   "authorization": global.getJWTAuth("CUSTOMER"),
};

describe("Customer Offering API", () => {
   it("returns 200 on fetching available offerings", async () => {
      await request(app)
         .get('/api/v2/po/offerings')
         .set(headers)
         .send()
         .expect(200);
   }, 20000);
});
