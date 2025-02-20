import request from "supertest";
import { app } from "../../app";

const headers = {
   "authorization":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMDg3ZTdiN2YtYmY2OC00ZDYzLTkwN2ItOWE5Mzc0YTg5NDIwIiwiYnZuIjpudWxsLCJmaXJzdE5hbWUiOiJCaXNvbHUiLCJsYXN0TmFtZSI6Ikhhc24iLCJmaXJzdExvZ2luIjpmYWxzZSwidXVpZFRva2VuIjoiS1k0RlBVTEY0SFowV0tNR0FNLTYxU0QtNlJVM0xXRzYiLCJpc0VuYWJsZWQiOnRydWUsImlzTG9ja2VkIjpmYWxzZSwidmVyc2lvbiI6MywidXBkYXRlZEF0IjoiMjAyNS0wMi0xM1QyMDo1ODozNi43MjdaIn0sIlRlbmFudCI6W3siaWQiOiIyNzRiMDgyZS01MjU3LTQ5N2ItYWUxMy01NmUzMTU5NTVlZWMiLCJuYW1lIjoiQ2hhbnBlbCBIaWxsIERlbmhhbSBTZWN1cml0aWVzIiwiUm9sZXMiOlt7Im5hbWUiOiJDVVNUT01FUiJ9XX1dLCJpYXQiOjE3Mzk0ODAzMTcsImV4cCI6MTczOTQ4MzkxN30.0qSBm3UrpJ_da6he_vkN6y2A2ry_LembNCRXS9CC16M",
};
it(`Returns 200 on successful auth check`, async ()=>{
   await request(app)
      .get('/api/v2/customer/saveplan/savein')
      .set(headers)
      .send()
      .expect(200);
}, 20000);