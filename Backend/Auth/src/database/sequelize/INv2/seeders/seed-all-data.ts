/* eslint-disable camelcase */
 
// npx sequelize-cli db:seed                            -- Seeds admin only
// npx sequelize-cli db:seed --seed seed-all-data.js    -- Seeds admin only
import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const up = async (queryInterface: QueryInterface) => {
   const transaction = await queryInterface.sequelize.transaction();
   try{
      await queryInterface.bulkInsert('tenants', [
         { id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d',  name: 'Super Admin',  email: 'integrations@chapelhilldenham.com'
            , tenant_type: 101, is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date()  }
         , { id: '274b082e-5257-497b-ae13-56e315955eec', p_id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d', name: 'Chanpel Hill Denham Securities',  code: 'CHDS', email: 'chds@chapelhilldenham.com'
            , tenant_type: 105, is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date()  }
      ], {transaction});
      console.log('Tenants created');
      await queryInterface.bulkInsert('users', [
         { id: '646d4127-1c58-4ba0-a4a1-6943f178d16a', version: 0, bvn: '12345678901', first_name: 'Super', last_name: 'Admin', email: 'integrations@investinltd.com'
            , password: '12f20c34fbc6c0ded4202a423088a36e46513123360544c8728dcaa36bcfd05320d693bdd4901b8ebb050b86163381e400a1766a16768a302db43eec1034cc92.504ff8a08af159e4'
            , is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date() }
         , { id: '30e6b26b-4363-4c2a-ade2-ce97b1144d39', version: 0, bvn: '12345258902', first_name: 'CHDS Admin', last_name: 'Frances', email: 'fajumobi@investinltd.com'
            , password: '12f20c34fbc6c0ded4202a423088a36e46513123360544c8728dcaa36bcfd05320d693bdd4901b8ebb050b86163381e400a1766a16768a302db43eec1034cc92.504ff8a08af159e4'
            , is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date() }
         , { id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39', version: 0, bvn: '12345258903', first_name: 'CHDS Admin', last_name: 'Abimbola', email: 'ahassan@investinltd.com'
            , password: '12f20c34fbc6c0ded4202a423088a36e46513123360544c8728dcaa36bcfd05320d693bdd4901b8ebb050b86163381e400a1766a16768a302db43eec1034cc92.504ff8a08af159e4'
            , is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date() }
      ], {transaction});
      console.log('Users created');
      await queryInterface.bulkInsert('roles', [
         { id: '302320b8-8417-4f09-bb70-15af7dfa8342',  name: 'SUPER_ADMIN', description: 'Handles the overall system duties', }
         , { id: '79a62264-88b5-46e7-9bcc-b5cf0e2580cc',  name: 'TENANT_ADMIN', description: 'Manages tenant', }
         , { id: uuidv4(),  name: 'TENANT_OFFICER', description: 'An officer in tenant', }
         , { id: uuidv4(),  name: 'CUSTOMER', description: 'A customer in a tenant', }
      ], {transaction});
      console.log('Roles created');
      await queryInterface.bulkInsert('tenant_user_roles', [
         { role_id: '302320b8-8417-4f09-bb70-15af7dfa8342',  user_id: '646d4127-1c58-4ba0-a4a1-6943f178d16a', tenant_id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d', created_at: new Date(), updated_at: new Date() , }
         , { role_id: '79a62264-88b5-46e7-9bcc-b5cf0e2580cc',  user_id: '30e6b26b-4363-4c2a-ade2-ce97b1144d39', tenant_id: '274b082e-5257-497b-ae13-56e315955eec', created_at: new Date(), updated_at: new Date() , }
         , { role_id: '79a62264-88b5-46e7-9bcc-b5cf0e2580cc',  user_id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39', tenant_id: '274b082e-5257-497b-ae13-56e315955eec', created_at: new Date(), updated_at: new Date() , }
      ], {transaction});
      console.log('tenant_user_roles created');

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
