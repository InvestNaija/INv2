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
     details: JSON.stringify({ phone: '12345678901', address: '123 Admin St' }),
     tenant_roles: JSON.stringify([{ id: 123, name: 'Cool tenant', roles: [{ id: 1, name: 'admin' }] }]),
     version: 0,
     p_id: '646d4127-1c58-4ba0-a4a1-6943f178d16a',
     deleted_at: null,
   },
   {
     id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39',
     created_at: new Date(),
     updated_at: new Date(),
     details: JSON.stringify({ phone: '9876543210', address: '456 Admin St' }),
     tenant_roles: JSON.stringify([{ id: 456, name: 'CHDS Tenant', roles: [{ id: 2, name: 'user' }] }]),
     version: 0,
     p_id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39',
     deleted_at: null,
   },
   { id: '087e7b7f-bf68-4d63-907b-9a9374a89420', version: 0
      , details:  JSON.stringify({"user":{"id":"087e7b7f-bf68-4d63-907b-9a9374a89420","bvn":null,"firstName":"okeee","lastName":"ikis","firstLogin":false,"uuidToken":"SS5DHVQXR5AUNXZVL4W27CZUBHHUADJU","isEnabled":true,"isLocked":false,"version":2,"updatedAt":"2025-02-13T19:01:21.534Z"}})
      , tenant_roles: JSON.stringify({"Tenant":[{"id":"274b082e-5257-497b-ae13-56e315955eec","name":"Chanpel Hill Denham Securities","Roles":[{"name":"CUSTOMER"}]}]})
      , created_at: new Date(), updated_at: new Date() }
 ];

const up = async (queryInterface: QueryInterface) => {
   const transaction = await queryInterface.sequelize.transaction();
   try{
      await queryInterface.bulkInsert('users',users, {transaction});
      console.log('Users created');
      await queryInterface.bulkInsert('lms',      [
         {
            id: '30b26b-4363-4c2a-ade2-ce97b1145d39',
            created_at: new Date(),
            updated_at: new Date(),
            title: "New dawn",
            type: "greaty",
            version: 1,
            deleted_at: null,
         },
         {
            id: '200ab26b-4363-4c2a-ade2-ce97b1145d39',
            created_at: new Date(),
            updated_at: new Date(),
            title: "School bus",
            type: "greaty",
            version: 1,
            deleted_at: null,
         },
       ], {transaction});
      console.log('Lms created');

      await transaction.commit();
   } catch (error) {
      await transaction.rollback();
      if(error instanceof Error) console.log(error.message);
   }
};
const down = async (queryInterface: QueryInterface)=> {
   await queryInterface.bulkDelete('feeds', {}, { });
};
export { up,  down, users};
