"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenant = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const common_1 = require("@inv2/common");
const __1 = require("../");
let Tenant = class Tenant extends sequelize_typescript_1.Model {
    get tenantType() {
        const rawValue = this.getDataValue('tenantType');
        return common_1.DBEnums.TenantType.find(g => g.code === rawValue);
    }
    set tenantType(value) {
        var _a, _b;
        const result = (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.TenantType) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('tenantType', result);
    }
};
exports.Tenant = Tenant;
__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    __metadata("design:type", String)
], Tenant.prototype, "pId", void 0);
__decorate([
    sequelize_typescript_1.IsEmail,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Tenant.prototype, "tenantType", null);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
    }),
    __metadata("design:type", String)
], Tenant.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(200),
    }),
    __metadata("design:type", String)
], Tenant.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
    }),
    __metadata("design:type", String)
], Tenant.prototype, "phone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: true
    }),
    __metadata("design:type", String)
], Tenant.prototype, "isEnabled", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        defaultValue: true
    }),
    __metadata("design:type", String)
], Tenant.prototype, "isLocked", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => __1.TenantUserRole),
    __metadata("design:type", Array)
], Tenant.prototype, "tenantUserRoles", void 0);
exports.Tenant = Tenant = __decorate([
    (0, sequelize_typescript_1.Table)({
        paranoid: true,
        timestamps: true,
        tableName: "tenants",
        underscored: true,
    })
], Tenant);
