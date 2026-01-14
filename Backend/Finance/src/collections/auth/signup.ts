import { Item } from 'postman-collection';

const request = {
   "firstName": "Abimbs",
   "lastName": "Hans",
   "email": "infinitizon@gmail.com",
   "phone": "1031314120",
   "password": "ecdb16de9e22e30877d96820140b0e91.89714cc2ad55373c717b53b4625a712b"
};
// Create the final request
export class Signup {
   static item () {
      return new Item({
         name: `Signup`,
         description: `API to signup a new customer`,
         request: {
            header: [],
            url: "{{BASE_URL}}/auth/user/signup",
            method: 'POST',
            body: {
               mode: 'raw',
               raw: JSON.stringify(request),
            },
         }
      });
   }
}