import { Item } from 'postman-collection';

export class CreateQuiz {
   static item() {
      return new Item({
         name: `Create Quiz`,
         description: `API to create a new quiz. Requires authentication.`,
         request: {
            header: [
               { key: "Content-Type", value: "application/json" },
               { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            url: "{{baseUrl}}/quiz",
            method: 'POST',
            body: {
               mode: 'raw',
               raw: JSON.stringify({
                  lmsId: "{{lmsId}}",
                  title: "JavaScript Fundamentals Quiz",
                  detail: "Test your knowledge of JavaScript basics",
                  startDate: "2026-02-01T00:00:00Z",
                  endDate: "2026-02-28T23:59:59Z",
                  isImmediateAnswer: true
               }, null, 2),
            },
         },
      });
   }
}

export class UpdateQuiz {
   static item(id: string = "{{quizId}}") {
      return new Item({
         name: `Update Quiz`,
         description: `API to update an existing quiz. Requires authentication.`,
         request: {
            header: [
               { key: "Content-Type", value: "application/json" },
               { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            url: `{{baseUrl}}/quiz/${id}`,
            method: 'PUT',
            body: {
               mode: 'raw',
               raw: JSON.stringify({
                  title: "Updated Quiz Title",
                  detail: "Updated quiz details",
                  startDate: "2026-03-01T00:00:00Z",
                  endDate: "2026-03-31T23:59:59Z",
                  isImmediateAnswer: false
               }, null, 2),
            },
         },
      });
   }
}

export class GetQuizById {
   static item(id: string = "{{quizId}}") {
      return new Item({
         name: `Get Quiz by ID`,
         description: `API to get a specific quiz by ID. Requires authentication.`,
         request: {
            header: [
               { key: "Accept", value: "application/json" },
               { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            url: `{{baseUrl}}/quiz/${id}`,
            method: 'GET',
         },
      });
   }
}

export class GetAllQuizzes {
   static item() {
      return new Item({
         name: `Get All Quizzes`,
         description: `API to get all quizzes. Requires authentication.`,
         request: {
            header: [
               { key: "Accept", value: "application/json" },
               { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            url: "{{baseUrl}}/quiz",
            method: 'GET',
         },
      });
   }
}

export class DeleteQuiz {
   static item(id: string = "{{quizId}}") {
      return new Item({
         name: `Delete Quiz`,
         description: `API to delete a quiz. Requires authentication.`,
         request: {
            header: [
               { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            url: `{{baseUrl}}/quiz/${id}`,
            method: 'DELETE',
         },
      });
   }
}

export class QuizHealthCheck {
   static item() {
      return new Item({
         name: `Quiz Health Check`,
         description: `Check if the Quiz service is running and healthy. No authentication required.`,
         request: {
            header: [],
            url: "{{baseUrl}}/quiz/health",
            method: 'GET',
         },
      });
   }
}
