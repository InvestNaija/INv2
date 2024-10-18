"use strict";
/* eslint-disable camelcase */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const uuid_1 = require("uuid");
const up = (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield queryInterface.sequelize.transaction();
    try {
        yield queryInterface.bulkInsert('tenants', [
            ...[{ id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d', name: 'Super Admin', email: 'integrations@chapelhilldenham.com',
                    tenant_type: 101, is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date() }],
            ...[{ id: '274b082e-5257-497b-ae13-56e315955eec', p_id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d', name: 'Chanpel Hill Denham Securities', code: 'CHDS', email: 'chds@chapelhilldenham.com',
                    tenant_type: 105, is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date() }],
        ], { transaction });
        console.log('Tenants created');
        yield queryInterface.bulkInsert('users', [
            ...[{ id: '646d4127-1c58-4ba0-a4a1-6943f178d16a', bvn: '12345678901', first_name: 'Super', last_name: 'Admin', email: 'integrations@investinltd.com',
                    password: '$2a$10$Bg8dRZwJP5hBR75DgrVQHeeE3TkokdLIUEnYW0Db0E8DnVxf7o0wO', is_enabled: true, is_locked: false,
                    created_at: new Date(), updated_at: new Date() }],
            ...[{ id: '30e6b26b-4363-4c2a-ade2-ce97b1144d39', bvn: '12345258902', first_name: 'CHDS Admin', last_name: 'Frances', email: 'fajumobi@investinltd.com',
                    password: '$2a$10$Bg8dRZwJP5hBR75DgrVQHeeE3TkokdLIUEnYW0Db0E8DnVxf7o0wO', is_enabled: true, is_locked: false,
                    created_at: new Date(), updated_at: new Date() }],
            ...[{ id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39', bvn: '12345258903', first_name: 'CHDS Admin', last_name: 'Abimbola', email: 'ahassan@investinltd.com',
                    password: '$2a$10$Bg8dRZwJP5hBR75DgrVQHeeE3TkokdLIUEnYW0Db0E8DnVxf7o0wO', is_enabled: true, is_locked: false,
                    created_at: new Date(), updated_at: new Date() }],
        ], { transaction });
        console.log('Users created');
        yield queryInterface.bulkInsert('roles', [
            ...[{ id: '302320b8-8417-4f09-bb70-15af7dfa8342', name: 'SUPER_ADMIN', description: 'Handles the overall system duties', }],
            ...[{ id: '79a62264-88b5-46e7-9bcc-b5cf0e2580cc', name: 'TENANT_ADMIN', description: 'Manages tenant', }],
            ...[{ id: (0, uuid_1.v4)(), name: 'TENANT_OFFICER', description: 'An officer in tenant', }],
            ...[{ id: (0, uuid_1.v4)(), name: 'CUSTOMER', description: 'A customer in a tenant', }],
        ], { transaction });
        console.log('Roles created');
        yield queryInterface.bulkInsert('tenant_user_roles', [
            ...[{ role_id: '302320b8-8417-4f09-bb70-15af7dfa8342', user_id: '646d4127-1c58-4ba0-a4a1-6943f178d16a', tenant_id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d', created_at: new Date(), updated_at: new Date(), }],
            ...[{ role_id: '79a62264-88b5-46e7-9bcc-b5cf0e2580cc', user_id: '30e6b26b-4363-4c2a-ade2-ce97b1144d39', tenant_id: '274b082e-5257-497b-ae13-56e315955eec', created_at: new Date(), updated_at: new Date(), }],
            ...[{ role_id: '79a62264-88b5-46e7-9bcc-b5cf0e2580cc', user_id: '30e6b26b-4363-4c2a-ade2-ce97b1145d39', tenant_id: '274b082e-5257-497b-ae13-56e315955eec', created_at: new Date(), updated_at: new Date(), }],
        ], { transaction });
        console.log('tenant_user_roles created');
        yield transaction.commit();
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof Error)
            console.log(error.message);
    }
});
exports.up = up;
const down = (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
    yield queryInterface.bulkDelete('feeds', {}, {});
});
exports.down = down;
