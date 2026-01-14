import { Item } from 'postman-collection';

export class CreateLms {
   static item() {
      return new Item({
         name: `Create LMS`,
         description: `API to create LMS`,
         request: {
            header: [{ key: "Content-Type", value: "application/json" }],
            url: "{{BASE_URL}}/lms",
            method: 'POST',
            body: {
               mode: 'raw',
               raw: JSON.stringify({
                  title: "Articles of war",
                  type: "Hans",
                  content: "War is not a good thing",
                  price: 20.00,
                  summary: "What a great time of no war"
               }),
            },
         },
      });
   }
}

export class UpdateLms {
   static item(id: string) {
      return new Item({
         name: `Update LMS`,
         description: `API to update LMS`,
         request: {
            header: [{ key: "Content-Type", value: "application/json" }],
            url: `{{BASE_URL}}/lms/${id}`,
            method: 'PATCH',
            body: {
               mode: 'raw',
               raw: JSON.stringify({
                  title: "Updated title",
                  content: "Updated content",
               }),
            },
         },
      });
   }
}

export class GetLms {
   static item(id = "{{id}}", search = "{{search}}") {
      return new Item({
         name: `Get LMS`,
         description: `API to get and search LMS`,
         request: {
            header: [{ key: "Accept", value: "application/json" }],
            url: `{{BASE_URL}}/lms?id=${id}&search=${search}`,  // Add both query params
            method: 'GET',
         },
      });
   }
}
 

export class DeleteLms {
   static item(id: string) {
      return new Item({
         name: `Delete LMS`,
         description: `API to delete LMS`,
         request: {
            header: [],
            url: `{{BASE_URL}}/lms/${id}`,
            method: 'DELETE',
         },
      });
   }
}
