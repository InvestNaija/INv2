// Source: https://siddharth-lakhara.medium.com/generate-postman-collections-using-node-js-68fcf425d823

import { Collection } from 'postman-collection';
import * as fs from 'fs';
import { CreateLms, UpdateLms, GetLms, DeleteLms, LmsHealthCheck } from "./collections/lms/lms";
import { CreateQuiz, UpdateQuiz, GetQuizById, GetAllQuizzes, DeleteQuiz, QuizHealthCheck } from "./collections/quiz/quiz";
import { CreateQuestion, UpdateQuestion, GetQuestionById, GetAllQuestions, DeleteQuestion, QuestionHealthCheck, GetQuestionTypes } from "./collections/question/question";

// This is the postman collection
const postmanCollection = new Collection({
   info: {
      name: 'INv2 - LMS Microservice',
      description: {
         content: 'API collection for the INv2 Learning Management System microservice.\n\n## Base URL\n- Local: `http://localhost:3001/api/v2`\n- Production: Update the `baseUrl` variable accordingly\n\n## Authentication\nMost endpoints require a JWT token. Get your token from the Auth service and set it in the `accessToken` variable.',
         type: 'text/markdown'
      }
   },
   variable: [
      {
         key: "baseUrl",
         value: "http://localhost:3001/api/v2",
         type: "string"
      },
      {
         key: "accessToken",
         value: "",
         type: "string",
         description: "JWT token obtained from the Auth service"
      },
      {
         key: "lmsId",
         value: "",
         type: "string",
         description: "LMS ID for testing (set after creating an LMS)"
      },
      {
         key: "quizId",
         value: "",
         type: "string",
         description: "Quiz ID for testing (set after creating a quiz)"
      },
      {
         key: "questionId",
         value: "",
         type: "string",
         description: "Question ID for testing (set after creating a question)"
      }
   ],
   // Requests in this collection
   item: [
      {
         name: "Health Check",
         item: [
            LmsHealthCheck.item(),
            QuizHealthCheck.item(),
            QuestionHealthCheck.item()
         ]
      },
      {
         name: "LMS",
         item: [
            CreateLms.item(),
            GetLms.item(undefined, undefined, "Get All LMS"),
            GetLms.item("{{lmsId}}", undefined, "Get LMS by ID"),
            GetLms.item(undefined, "web development", "Search LMS"),
            UpdateLms.item("{{lmsId}}"),
            DeleteLms.item("{{lmsId}}")
         ]
      },
      {
         name: "Quiz",
         item: [
            CreateQuiz.item(),
            GetQuizById.item("{{quizId}}"),
            GetAllQuizzes.item(),
            UpdateQuiz.item("{{quizId}}"),
            DeleteQuiz.item("{{quizId}}")
         ]
      },
      {
         name: "Question",
         item: [
            CreateQuestion.item(),
            GetQuestionTypes.item(),
            GetQuestionById.item("{{questionId}}"),
            GetAllQuestions.item(),
            UpdateQuestion.item("{{questionId}}"),
            DeleteQuestion.item("{{questionId}}")
         ]
      }
   ],
});

// Convert the collection to JSON so that it can be exported to a file
const collectionJSON = postmanCollection.toJSON();
// Create a collection.json file. It can be imported to postman
fs.writeFile('./INv2-LMS.postman_collection.json', JSON.stringify(collectionJSON, null, 2), (err) => {
   if (err) {
      console.error('Error writing collection file:', err);
      return;
   }
   console.log('Postman collection file saved: INv2-LMS.postman_collection.json');
});
