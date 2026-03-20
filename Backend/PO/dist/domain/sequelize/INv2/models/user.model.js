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
exports.User = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const __1 = require("..");
let User = class User extends sequelize_typescript_1.Model {
    /**
    * Should hold a stringified list of other user data
    */
    get details() {
        return JSON.parse(this.getDataValue('details'));
    }
    set details(value) {
        this.setDataValue('details', JSON.stringify(value));
    }
    /**
    * Should hold an array of tenant and roles a user has in tenants
    * [{id: 123, name: "Cool tenant", roles: [{id: 1, name: "user"}]}]
    */
    get tenantRoles() {
        return JSON.parse(this.getDataValue('tenantRoles'));
    }
    set tenantRoles(value) {
        this.setDataValue('tenantRoles', JSON.stringify(value));
    }
};
exports.User = User;
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => __1.SavePlan, () => __1.SavePlanUser),
    __metadata("design:type", Array)
], User.prototype, "saveplans", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 0 }),
    __metadata("design:type", Number)
], User.prototype, "version", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID }),
    __metadata("design:type", String)
], User.prototype, "pId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, }),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], User.prototype, "details", null);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, }),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], User.prototype, "tenantRoles", null);
exports.User = User = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "users",
        underscored: true,
        paranoid: true,
    })
], User);
