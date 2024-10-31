// Source: https://siddharth-lakhara.medium.com/generate-postman-collections-using-node-js-68fcf425d823

import { Collection } from 'postman-collection';
import * as fs from 'fs';
import { Signup } from "./collections/auth/signup";
import { CreateLms, UpdateLms, GetLms, DeleteLms } from "./collections/lms/lms";

// This is the our postman collection
const postmanCollection = new Collection({
   info: {
      name: 'INv2',
   },
   variable: [
      {
         key: "BASE_URL",
         value: "http://localhost:4545/api/v2",
         type: "string"
      },
   ],
   auth: {
      type: "bearer",
      bearer: [
         {
            "key": "token",
            "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc0MTAyMWNkLWUxNDMtNGJkOC1iNDFmLTg1MTBhMDdjZDIwNyIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTY3ODIwMDYzOSwiZXhwIjoxNjc4Mjg3MDM5fQ.VOT4aSID08C80fe_RSlEMvMP40JCvjPoVBAijhaBUtI",
            "type": "string"
         }
      ]
   },
   // Requests in this collection
   item: [
      {
         name: "Auth",
         id: "auth",
         item: [
            Signup.item()
         ]
      },
      {
         name: "LMS",
         item: [
            CreateLms.item(),
            UpdateLms.item("123"),
            GetLms.item("123", "example"),
            DeleteLms.item("123")
         ]
      }
   ],
});
// const { Header } = require('postman-collection');
// // This string will be parsed to create header
// const rawHeaderString = 'Authorization:\nContent-Type:application/json\ncache-control:no-cache\n';
// // Parsing string to postman compatible format
// const rawHeaders = Header.parse(rawHeaderString);
// // Generate headers
// const requestHeader = rawHeaders.map((h) => new Header(h));
// // API endpoint

// // Name of the request
// const requestName = 'Sample request name';

// // Request body
// const requestPayload = {
//    key1: 'value1',
//    key2: 'value2',
//    key3: 'value3'
// };
// // Create the final request
// const postmanRequest = new Item({
//    name: `${requestName}`,
//    request: {
//       header: requestHeader,
//       url: "{{BASE_URL}}/auth/user/signup",
//       method: 'POST',
//       body: {
//          mode: 'raw',
//          raw: JSON.stringify(requestPayload),
//       },
//    },
// });
 

// Convert the collection to JSON so that it can be exported to a file
const collectionJSON = postmanCollection.toJSON();
// Create a colleciton.json file. It can be imported to postman
fs.writeFile('./INv2.postman_collection.json', JSON.stringify(collectionJSON), (err) => {
   if (err) { console.log(err); }
   console.log('File saved');
});