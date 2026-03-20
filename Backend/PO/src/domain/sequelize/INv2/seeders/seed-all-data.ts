/* eslint-disable camelcase */
import { QueryInterface, DataTypes } from 'sequelize';

const users = [
   // CUSTOMER role
   { 
      id: '087e7b7f-bf68-4d63-907b-9a9374a89420', version: 0
      , details: '{"user":{"id":"087e7b7f-bf68-4d63-907b-9a9374a89420","bvn":null,"firstName":"Bisolu","lastName":"Hasn","firstLogin":false,"uuidToken":"MBO5W5N7Y-GOG3NXR3-L3B0PVW8AUONS","isEnabled":true,"isLocked":false,"version":2,"updatedAt":"2025-02-13T19:01:21.534Z"}}'
      , tenant_roles: '{"Tenant":[{"id":"274b082e-5257-497b-ae13-56e315955eec","name":"Chanpel Hill Denham Securities","Roles":[{"name":"CUSTOMER"}]}]}'
      , created_at: new Date(), updated_at: new Date()
   },
   // ADMIN role
   { 
      id: '187e7b7f-bf68-4d63-907b-9a9374a89421', version: 0
      , details: '{"user":{"id":"187e7b7f-bf68-4d63-907b-9a9374a89421","bvn":null,"firstName":"Admin","lastName":"User","firstLogin":false,"uuidToken":"MBO5W5N7Y-GOG3NXR3-L3B0PVW8AUONS","isEnabled":true,"isLocked":false,"version":2,"updatedAt":"2025-02-13T19:01:21.534Z"}}'
      , tenant_roles: '{"Tenant":[{"id":"274b082e-5257-497b-ae13-56e315955eec","name":"Chanpel Hill Denham Securities","Roles":[{"name":"ADMIN"}]}]}'
      , created_at: new Date(), updated_at: new Date()
   }
];

const up = async (queryInterface: QueryInterface) => {
   const transaction = await queryInterface.sequelize.transaction();
   try{
      // Ensure users table exists in SQLite memory for testing
      await queryInterface.createTable('users', {
         id: { type: DataTypes.UUID, primaryKey: true },
         version: { type: DataTypes.INTEGER },
         details: { type: DataTypes.TEXT },
         tenant_roles: { type: DataTypes.TEXT },
         created_at: { type: DataTypes.DATE },
         updated_at: { type: DataTypes.DATE },
      }, { transaction });

      await queryInterface.bulkInsert('users', users, {transaction});
      console.log('Users created');
      await transaction.commit();
   } catch (error) {
      await transaction.rollback();
      if(error instanceof Error) console.log(error.message);
   }
};

const down = async (queryInterface: QueryInterface)=> {
   await queryInterface.bulkDelete('users', {}, { });
};

export { up, down, users };
