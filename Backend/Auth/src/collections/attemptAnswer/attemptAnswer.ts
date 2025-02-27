import { Item } from 'postman-collection';

const BASE_URL = "{{BASE_URL}}/attempt/answer"

export class AnswerAttempt {
   static item() {
      return new Item({
         name: `Answer Attempt`,
         description: `API to answer attempt`,
         request: {
            header: [{ key: "Content-Type", value: "application/json" }],
            url: `${BASE_URL}`,
            method: 'POST',
            body: {
               mode: 'raw',
               raw: JSON.stringify({
                  answerGiven: "Articles of war",
                  questionId: "123-456-789",
                  quizAttepmtId: "123-456-789"
               }),
            },
         },
      });
   }
}

export class UpdateAnswerAttempt {
   static item(id: string) {
      return new Item({
         name: `Update Attempt Answer`,
         description: `API to update Attempt Answer`,
         request: {
            header: [{ key: "Content-Type", value: "application/json" }],
            url: `${BASE_URL}/${id}`,
            method: 'PATCH',
            body: {
               mode: 'raw',
               raw: JSON.stringify({
                  answerGiven: "Updated answer",
               }),
            },
         },
      });
   }
}

export class GetAnswerAttempt {
   static item(id = "{{id}}", search = "{{search}}", attemptId = "{{attemptId}}", question = "{{question}}") {
      return new Item({
         name: `Get Attempt Answer`,
         description: `API to get and search Attempt Answer`,
         request: {
            header: [{ key: "Accept", value: "application/json" }],
            url: `${BASE_URL}?id=${id}&search=${search}&attemptId=${attemptId}&question=${question}`,  // Add both query params
            method: 'GET',
         },
      });
   }
}
 

export class DeleteAnswerAttempt {
   static item(id: string) {
      return new Item({
         name: `Delete LMS`,
         description: `API to delete LMS`,
         request: {
            header: [{ key: "Accept", value: "application/json" }],
            url: `${BASE_URL}/${id}`,
            method: 'DELETE',
         },
      });
   }
}
