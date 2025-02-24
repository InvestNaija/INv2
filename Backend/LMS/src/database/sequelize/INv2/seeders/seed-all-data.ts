/* eslint-disable camelcase */
 
// npx sequelize-cli db:seed                            -- Seeds admin only
// npx sequelize-cli db:seed --seed seed-all-data.js    -- Seeds admin only
import { version } from 'os';
import { QueryInterface } from 'sequelize';
import { lms, lmsId, lmsQuizId, questionId, questions, quizQuestionId, quiz_questions, quizzes } from './quizAttemptsSeeder';

const users = [
   { 
      id: '087e7b7f-bf68-4d63-907b-9a9374a89420', version: 0
      , details: '{"user":{"id":"087e7b7f-bf68-4d63-907b-9a9374a89420","bvn":null,"firstName":"Bisolu","lastName":"Hasn","firstLogin":false,"uuidToken":"MBO5W5N7Y-GOG3NXR3-L3B0PVW8AUONS","isEnabled":true,"isLocked":false,"version":2,"updatedAt":"2025-02-13T19:01:21.534Z"}}'
      , tenant_roles: '{"Tenant":[{"id":"274b082e-5257-497b-ae13-56e315955eec","name":"Chanpel Hill Denham Securities","Roles":[{"name":"CUSTOMER"}]}]}'
      , created_at: new Date(), updated_at: new Date()
   }
];

const up = async (queryInterface: QueryInterface) => {
   const transaction = await queryInterface.sequelize.transaction();
   try{
      await queryInterface.bulkInsert('users', users, {transaction});
      console.log('Users created');

      await queryInterface.bulkInsert('lms', lms, {transaction});
      console.log('LMS created');

      await queryInterface.bulkInsert('quizzes', quizzes, {transaction});
      console.log('LMS Quiz created');

      await queryInterface.bulkInsert('questions', questions, {transaction});
      console.log('LMS questions created');

      await queryInterface.bulkInsert('quiz_questions', quiz_questions, {transaction});
      console.log('LMS Quiz Question created');

      await transaction.commit();
   } catch (error) {
      await transaction.rollback();
      if(error instanceof Error) console.log(error.message);
   }
};
const down = async (queryInterface: QueryInterface)=> {
   await queryInterface.bulkDelete('feeds', {}, { });
};
export { up,  down, users };
