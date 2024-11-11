import { Item } from 'postman-collection';

export class StartQuizAttempt {
   static baseUrl = "{{BASE_URL}}/quiz/attempt"
   static item(quiz: string) {
      return new Item({
         name: `Start Quiz Attempt`,
         description: `API to start Quiz attempt`,
         request: {
            header: [{ key: "Content-Type", value: "application/json" }],
            url: `${this.baseUrl}/start/${quiz}`,
            method: 'POST'
         },
      });
   }
}

export class EndQuizAttempt {
   static baseUrl = "{{BASE_URL}}/quiz/attempt"
   static item(quiz: string) {
      return new Item({
         name: `End Quiz Attempt`,
         description: `API to end Quiz attempt`,
         request: {
            header: [{ key: "Content-Type", value: "application/json" }],
            url: `${this.baseUrl}/end/${quiz}`,
            method: 'POST'
         },
      });
   }
}

export class DeleteQuizAttempt {
   static baseUrl = "{{BASE_URL}}/quiz/attempt"
   static item(id: string) {
      return new Item({
         name: `Delete Quiz Attempt`,
         description: `API to delete Quiz attempt`,
         request: {
            header: [{ key: "Content-Type", value: "application/json" }],
            url: `${this.baseUrl}/${id}`,
            method: 'DELETE'
         },
      });
   }
}

export class GetQuizAttempt {
   static baseUrl = "{{BASE_URL}}/quiz/attempt"
   static item(quiz: string) {
      return new Item({
         name: `Get Quiz Attempt`,
         description: `API to get Quiz attempt`,
         request: {
            header: [{ key: "Content-Type", value: "application/json" }],
            url: `${this.baseUrl}?quiz=${quiz}`,
            method: 'GET'
         },
      });
   }
}
