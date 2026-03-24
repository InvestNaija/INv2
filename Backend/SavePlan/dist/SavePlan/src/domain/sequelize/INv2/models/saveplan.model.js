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
exports.SavePlan = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const __1 = require("..");
const common_1 = require("@inv2/common");
let SavePlan = class SavePlan extends sequelize_typescript_1.Model {
    /** Type of the saveplan. Options are planin, savein, custom and wallet */
    get type() {
        const rawValue = this.getDataValue('type');
        return common_1.DBEnums.SaveplanType.find(g => g.code === rawValue);
    }
    set type(value) {
        var _a, _b;
        const result = (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.SaveplanType) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('type', result);
    }
    /** Calculator to be used for this plan. Now stored in the DBEnums */
    get calculator() {
        const rawValue = this.getDataValue('calculator');
        return common_1.DBEnums.SaveplanCalculatorType.find(g => g.code === rawValue);
    }
    set calculator(value) {
        var _a, _b;
        const result = (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.SaveplanCalculatorType) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('calculator', result);
    }
    /** Currency to be used. Currency is the global DBEnum */
    get currency() {
        const rawValue = this.getDataValue('currency');
        return common_1.DBEnums.Currency.find(g => g.code === rawValue);
    }
    set currency(value) {
        var _a, _b;
        const result = (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.Currency) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('currency', result);
    }
};
exports.SavePlan = SavePlan;
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => __1.User, () => __1.SavePlanUser),
    __metadata("design:type", Array)
], SavePlan.prototype, "users", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => __1.SavePlanCharge),
    __metadata("design:type", Array)
], SavePlan.prototype, "saveplanChargeTypes", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlan.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlan.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlan.prototype, "deletedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, defaultValue: 0, }),
    __metadata("design:type", Number)
], SavePlan.prototype, "version", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], SavePlan.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(300), }),
    __metadata("design:type", String)
], SavePlan.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(300), }),
    __metadata("design:type", String)
], SavePlan.prototype, "slug", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], SavePlan.prototype, "type", null);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], SavePlan.prototype, "calculator", null);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], SavePlan.prototype, "currency", null);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(1000), }),
    __metadata("design:type", String)
], SavePlan.prototype, "summary", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, }),
    __metadata("design:type", String)
], SavePlan.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), }),
    __metadata("design:type", Number)
], SavePlan.prototype, "interestRate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), }),
    __metadata("design:type", Number)
], SavePlan.prototype, "minDuration", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), }),
    __metadata("design:type", Number)
], SavePlan.prototype, "maxDuration", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), }),
    __metadata("design:type", Number)
], SavePlan.prototype, "minAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 2), }),
    __metadata("design:type", Number)
], SavePlan.prototype, "maxAmount", void 0);
exports.SavePlan = SavePlan = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "saveplans",
        underscored: true,
        paranoid: true,
    })
], SavePlan);
// export default {User};
