/* eslint-disable camelcase */
 
// npx sequelize-cli db:seed                            -- Seeds admin only
// npx sequelize-cli db:seed --seed seed-all-data.js    -- Seeds admin only
import { QueryInterface } from 'sequelize';
// import { v4 as uuidv4 } from 'uuid';

const users = [
   {
     id: '646d4127-1c58-4ba0-a4a1-6943f178d16a',
     created_at: new Date(),
     updated_at: new Date(),
     details: JSON.stringify({ user: { id: '646d4127-1c58-4ba0-a4a1-6943f178d16a', phone: '12345678901', address: '123 Admin St' } }),
     tenant_roles: JSON.stringify({ Tenant: [{ id: 123, name: 'Cool tenant', Roles: [{ name: 'PROVIDER' }] }] }),
     version: 0,
     p_id: '646d4127-1c58-4ba0-a4a1-6943f178d16a',
     deleted_at: null,
   },
   {
     id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39',
     created_at: new Date(),
     updated_at: new Date(),
     details: JSON.stringify({ user: { id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39', phone: '9876543210', address: '456 Admin St' } }),
     tenant_roles: JSON.stringify({ Tenant: [{ id: 456, name: 'CHDS Tenant', Roles: [{ name: 'SUPER_ADMIN' }] }] }),
     version: 0,
     p_id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39',
     deleted_at: null,
   },
   { 
     id: '087e7b7f-bf68-4d63-907b-9a9374a89420', 
     version: 0,
     details: JSON.stringify({"user":{"id":"087e7b7f-bf68-4d63-907b-9a9374a89420","bvn":null,"firstName":"okeee","lastName":"ikis","firstLogin":false,"uuidToken":"SS5DHVQXR5AUNXZVL4W27CZUBHHUADJU","isEnabled":true,"isLocked":false,"version":2,"updatedAt":"2025-02-13T19:01:21.534Z"}}),
     tenant_roles: JSON.stringify({"Tenant":[{"id":"274b082e-5257-497b-ae13-56e315955eec","name":"Chanpel Hill Denham Securities","Roles":[{"name":"CUSTOMER"}]}]}),
     created_at: new Date(), 
     updated_at: new Date() 
   }
];

const lmsEntries = [
   {
      id: '30b26b00-4363-4c2a-ade2-ce97b1145d39',
      created_at: new Date(),
      updated_at: new Date(),
      title: "New dawn",
      type: 101, // art
      version: 1,
      deleted_at: null,
   },
   {
      id: '200ab26b-4363-4c2a-ade2-ce97b1145d39',
      created_at: new Date(),
      updated_at: new Date(),
      title: "School bus",
      type: 135, // crs (Course)
      version: 1,
      deleted_at: null,
   },
   {
      id: '8f72d5a3-4c71-401e-acba-05e5bac5c94c',
      created_at: new Date(),
      updated_at: new Date(),
      title: "Parent Course",
      type: 135, // crs (Course)
      version: 1,
      deleted_at: null,
   },
];

const quizzes = [
   {
      id: 'a1b2c3d4-1234-5678-9abc-def012345678',
      lms_id: '200ab26b-4363-4c2a-ade2-ce97b1145d39',
      title: 'JavaScript Basics Quiz',
      detail: 'Test your knowledge of JavaScript fundamentals',
      start_date: new Date('2026-01-01'),
      end_date: new Date('2026-12-31'),
      is_immediate_answer: true,
      user_id: '646d4127-1c58-4ba0-a4a1-6943f178d16a',
      created_at: new Date(),
      updated_at: new Date(),
      version: 1,
      deleted_at: null,
   },
   {
      id: 'b2c3d4e5-2345-6789-abcd-ef0123456789',
      lms_id: '200ab26b-4363-4c2a-ade2-ce97b1145d39',
      title: 'JavaScript Advanced Quiz',
      detail: 'Advanced JavaScript concepts',
      start_date: new Date('2026-01-01'),
      end_date: new Date('2026-12-31'),
      is_immediate_answer: true,
      user_id: '646d4127-1c58-4ba0-a4a1-6943f178d16a',
      created_at: new Date(),
      updated_at: new Date(),
      version: 1,
      deleted_at: null,
   },
];

const questions = [
   {
      id: '22b26b00-4363-4c2a-ade2-ce97b1145d39',
      title: 'What is JavaScript?',
      details: 'A question about JavaScript basics',
      type: 1, // multiple_choice
      created_at: new Date(),
      updated_at: new Date(),
      version: 1,
      deleted_at: null,
   },
   {
      id: '22b26b00-4363-4c2a-ade2-ce97b1145d40',
      title: 'What is TypeScript?',
      details: 'A question about TypeScript',
      type: 1,
      created_at: new Date(),
      updated_at: new Date(),
      version: 1,
      deleted_at: null,
   },
];

const quizQuestions = [
   {
      id: '33b26b00-4363-4c2a-ade2-ce97b1145d39',
      quiz_id: 'a1b2c3d4-1234-5678-9abc-def012345678',
      question_id: '22b26b00-4363-4c2a-ade2-ce97b1145d39',
      user_id: '646d4127-1c58-4ba0-a4a1-6943f178d16a', // PROVIDER user
      pass_scrore: 10,
      fail_scrore: 0,
      order: 1,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
   },
   {
      id: '33b26b00-4363-4c2a-ade2-ce97b1145d40',
      quiz_id: 'a1b2c3d4-1234-5678-9abc-def012345678',
      question_id: '22b26b00-4363-4c2a-ade2-ce97b1145d40',
      user_id: '646d4127-1c58-4ba0-a4a1-6943f178d16a', // PROVIDER user
      pass_scrore: 10,
      fail_scrore: 0,
      order: 2,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
   },
];

const questionAnswers = [
   {
      id: '44b26b00-4363-4c2a-ade2-ce97b1145d39',
      question_id: '22b26b00-4363-4c2a-ade2-ce97b1145d39',
      answer: 'A programming language',
      details: 'JavaScript is a high-level programming language',
      is_valid: true,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
   },
   {
      id: '44b26b00-4363-4c2a-ade2-ce97b1145d40',
      question_id: '22b26b00-4363-4c2a-ade2-ce97b1145d40',
      answer: 'A typed superset of JavaScript',
      details: 'TypeScript adds static typing to JavaScript',
      is_valid: true,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
   },
];

const quizAttempts = [
   {
      id: '55b26b00-4363-4c2a-ade2-ce97b1145d39',
      quiz_id: 'a1b2c3d4-1234-5678-9abc-def012345678',
      user_id: '087e7b7f-bf68-4d63-907b-9a9374a89420',
      attempt_start: new Date(),
      attempt_end: null,
      attempt_ip: '127.0.0.1',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
   },
   {
      id: '55b26b00-4363-4c2a-ade2-ce97b1145d40',
      quiz_id: 'a1b2c3d4-1234-5678-9abc-def012345678',
      user_id: '087e7b7f-bf68-4d63-907b-9a9374a89420',
      attempt_start: new Date(),
      attempt_end: null,
      attempt_ip: '127.0.0.2',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
   },
];

const attemptAnswers = [
   {
      id: '66b26b00-4363-4c2a-ade2-ce97b1145d39',
      quiz_attempt_id: '55b26b00-4363-4c2a-ade2-ce97b1145d39',
      question_id: '22b26b00-4363-4c2a-ade2-ce97b1145d39',
      answer_given: 'A programming language',
      answer_score: 10,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
   },
   {
      id: '66b26b00-4363-4c2a-ade2-ce97b1145d40',
      quiz_attempt_id: '55b26b00-4363-4c2a-ade2-ce97b1145d40',
      question_id: '22b26b00-4363-4c2a-ade2-ce97b1145d40',
      answer_given: 'A typed superset',
      answer_score: 10,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
   },
];

const up = async (queryInterface: QueryInterface) => {
   const transaction = await queryInterface.sequelize.transaction();
   try{
      await queryInterface.bulkInsert('users', users, {transaction});
      await queryInterface.bulkInsert('lms', lmsEntries, {transaction});
      await queryInterface.bulkInsert('quizzes', quizzes, {transaction});
      await queryInterface.bulkInsert('questions', questions, {transaction});
      await queryInterface.bulkInsert('quiz_questions', quizQuestions, {transaction});
      await queryInterface.bulkInsert('question_answers', questionAnswers, {transaction});
      await queryInterface.bulkInsert('quiz_attempts', quizAttempts, {transaction});
      await queryInterface.bulkInsert('quiz_attempt_answers', attemptAnswers, {transaction});
      await transaction.commit();
   } catch (error) {
      await transaction.rollback();
      if(error instanceof Error) console.log('Seed error:', error.message);
   }
};

const down = async (queryInterface: QueryInterface)=> {
   await queryInterface.bulkDelete('quiz_attempt_answers', {}, { });
   await queryInterface.bulkDelete('quiz_attempts', {}, { });
   await queryInterface.bulkDelete('question_answers', {}, { });
   await queryInterface.bulkDelete('quiz_questions', {}, { });
   await queryInterface.bulkDelete('questions', {}, { });
   await queryInterface.bulkDelete('quizzes', {}, { });
   await queryInterface.bulkDelete('lms', {}, { });
   await queryInterface.bulkDelete('users', {}, { });
};

export { up, down, users, lmsEntries, quizzes };
