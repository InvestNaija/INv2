/* eslint-disable camelcase */
 
// npx sequelize-cli db:seed                            -- Seeds admin only
// npx sequelize-cli db:seed --seed seed-all-data.js    -- Seeds admin only
import { QueryInterface } from 'sequelize';
// import { v4 as uuidv4 } from 'uuid';
const users = [
   // CUSTOMER role, password = Dickele_1
   { 
      id: 'ebe5e1c4-e2ff-4441-963a-e9ab04b7f9e8', version: 0
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
