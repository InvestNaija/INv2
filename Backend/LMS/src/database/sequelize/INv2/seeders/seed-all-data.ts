/* eslint-disable camelcase */
 
// npx sequelize-cli db:seed                            -- Seeds admin only
// npx sequelize-cli db:seed --seed seed-all-data.js    -- Seeds admin only
import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const up = async (queryInterface: QueryInterface) => {
   const transaction = await queryInterface.sequelize.transaction();
   try{
      await queryInterface.bulkInsert('users',      [
         {
           id: '646d4127-1c58-4ba0-a4a1-6943f178d16a',
           created_at: new Date(),
           updated_at: new Date(),
           details: JSON.stringify({ phone: '12345678901', address: '123 Admin St' }),
           tenant_roles: JSON.stringify([{ id: 123, name: 'Cool tenant', roles: [{ id: 1, name: 'admin' }] }]),
           version: 1,
           p_id: '646d4127-1c58-4ba0-a4a1-6943f178d16a',
           deleted_at: null,
         },
         {
           id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39',
           created_at: new Date(),
           updated_at: new Date(),
           details: JSON.stringify({ phone: '9876543210', address: '456 Admin St' }),
           tenant_roles: JSON.stringify([{ id: 456, name: 'CHDS Tenant', roles: [{ id: 2, name: 'user' }] }]),
           version: 1,
           p_id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39',
           deleted_at: null,
         },
       ], {transaction});
      console.log('Users created');
      await queryInterface.bulkInsert('lms',      [
         {
            id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39',
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
export { up,  down, };
