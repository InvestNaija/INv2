import request from "supertest";
import { app } from "../../../app";

const headers = {
   "authorization": global.getJWTAuth("ADMIN"),
};

describe("Admin Offering API", () => {
   it("returns 201 on correctly validating and creating an offering", async () => {
      await request(app)
         .post('/api/v2/po/admin/offerings')
         .set(headers)
         .send({
             name: "Test Offering",
             description: "Investment offering for tests",
             offerPrice: 5000,
             currency: "NGN",
             minimumUnitsToPurchase: 10,
             subsequentMultipleUnits: 5,
             openingDate: new Date(),
             closingDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30)
         })
         .expect(201);
   }, 20000);
});
