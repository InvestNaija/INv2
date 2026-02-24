/* eslint-disable camelcase */
import { QueryInterface } from 'sequelize';

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
        id: '087e7b7f-bf68-4d63-907b-9a9374a89420',
        version: 0,
        details: JSON.stringify({
            "user": {
                "id": "087e7b7f-bf68-4d63-907b-9a9374a89420",
                "firstName": "okeee",
                "lastName": "ikis",
                "isEnabled": true,
                "version": 2
            }
        }),
        tenant_roles: JSON.stringify({
            "Tenant": [{
                "id": "274b082e-5257-497b-ae13-56e315955eec",
                "name": "Chanpel Hill Denham Securities",
                "Roles": [{ "name": "CUSTOMER" }]
            }]
        }),
        created_at: new Date(),
        updated_at: new Date()
    }
];

const tradeinProfiles = [
    {
        id: 'a1b2c3d4-1234-5678-9abc-def012345678',
        user_id: '087e7b7f-bf68-4d63-907b-9a9374a89420',
        external_id: '562379',
        provider: process.env.ACTIVE_TRADE_PROVIDER || 'ZANIBAL',
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
    }
];

const up = async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        await queryInterface.bulkInsert('users', users, { transaction });
        console.log('Users created');

        await queryInterface.bulkInsert('tradein_profiles', tradeinProfiles, { transaction });
        console.log('TradeIN Profiles created');

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        if (error instanceof Error) console.log(error.message);
    }
};

const down = async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('tradein_profiles', {}, {});
    await queryInterface.bulkDelete('users', {}, {});
};

export { up, down, users, tradeinProfiles };
