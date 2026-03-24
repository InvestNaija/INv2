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
exports.users = exports.down = exports.up = void 0;
// import { v4 as uuidv4 } from 'uuid';
const users = [
    // CUSTOMER role, password = Dickele_1
    {
        id: '087e7b7f-bf68-4d63-907b-9a9374a89420', version: 0,
        details: '{"user":{"id":"087e7b7f-bf68-4d63-907b-9a9374a89420","bvn":null,"firstName":"Bisolu","lastName":"Hasn","firstLogin":false,"uuidToken":"MBO5W5N7Y-GOG3NXR3-L3B0PVW8AUONS","isEnabled":true,"isLocked":false,"version":2,"updatedAt":"2025-02-13T19:01:21.534Z"}}',
        tenant_roles: '{"Tenant":[{"id":"274b082e-5257-497b-ae13-56e315955eec","name":"Chanpel Hill Denham Securities","Roles":[{"name":"CUSTOMER"}]}]}',
        created_at: new Date(), updated_at: new Date()
    }
];
exports.users = users;
const up = (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield queryInterface.sequelize.transaction();
    try {
        yield queryInterface.bulkInsert('users', users, { transaction });
        console.log('Users created');
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
