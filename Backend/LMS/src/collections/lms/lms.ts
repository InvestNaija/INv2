import { Item } from 'postman-collection';

export class CreateLms {
   static item() {
      return new Item({
         name: `Create LMS`,
         description: `API to create a new LMS entry. Requires authentication.`,
         request: {
            header: [
               { key: "Content-Type", value: "application/json" },
               { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            url: "{{baseUrl}}/lms",
            method: 'POST',
            body: {
               mode: 'raw',
               raw: JSON.stringify({
                  title: "Introduction to Web Development",
                  type: "art",
                  summary: "A comprehensive guide to web development",
                  content: "Full course content here...",
                  price: "99.99",
                  pId: "{{lmsId}}"
               }, null, 2),
            },
         },
      });
   }
}

export class UpdateLms {
   static item(id: string = "{{lmsId}}") {
      return new Item({
         name: `Update LMS`,
         description: `API to update an existing LMS entry. Requires authentication.`,
         request: {
            header: [
               { key: "Content-Type", value: "application/json" },
               { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            url: `{{baseUrl}}/lms/${id}`,
            method: 'PUT',
            body: {
               mode: 'raw',
               raw: JSON.stringify({
                  title: "Updated Title",
                  summary: "Updated summary",
                  content: "Updated content",
                  price: "149.99"
               }, null, 2),
            },
         },
      });
   }
}

export class GetLms {
   static item(id?: string, search?: string, name?: string) {
      const queryParams: string[] = [];
      if (id) queryParams.push(`id=${id}`);
      if (search) queryParams.push(`search=${search}`);
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      
      let itemName = `Get LMS`;
      if (id) itemName = `Get LMS by ID`;
      else if (search) itemName = `Search LMS`;
      
      return new Item({
         name: name || itemName,
         description: `API to get LMS entries. Supports filtering by ID or search term. Requires authentication.`,
         request: {
            header: [
               { key: "Accept", value: "application/json" },
               { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            url: `{{baseUrl}}/lms${queryString}`,
            method: 'GET',
         },
      });
   }
}

export class DeleteLms {
   static item(id: string = "{{lmsId}}") {
      return new Item({
         name: `Delete LMS`,
         description: `API to delete (soft delete) an LMS entry. Requires authentication.`,
         request: {
            header: [
               { key: "Authorization", value: "Bearer {{accessToken}}" }
            ],
            url: `{{baseUrl}}/lms/${id}`,
            method: 'DELETE',
         },
      });
   }
}

export class LmsHealthCheck {
   static item() {
      return new Item({
         name: `LMS Health Check`,
         description: `Check if the LMS service is running and healthy. No authentication required.`,
         request: {
            header: [],
            url: "{{baseUrl}}/lms/healthz",
            method: 'GET',
         },
      });
   }
}
