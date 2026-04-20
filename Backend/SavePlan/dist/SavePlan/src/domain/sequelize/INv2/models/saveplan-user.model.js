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
exports.SavePlanUser = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const __1 = require("..");
const common_1 = require("@inv2/common");
let SavePlanUser = class SavePlanUser extends sequelize_typescript_1.Model {
    /** Status of this plan. Used to be stored as boolean, now stored in the DBEnums */
    get status() {
        const rawValue = this.getDataValue('status');
        return common_1.DBEnums.OrderStatus.find(g => g.code === rawValue);
    }
    set status(value) {
        var _a, _b;
        const result = (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.OrderStatus) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('status', result);
    }
    /** Gateway you want to use for this plan. Now stored in the DBEnums. Can easily be changed if needed */
    get gateway() {
        const rawValue = this.getDataValue('gateway');
        return common_1.DBEnums.Gateway.find(g => g.code === rawValue);
    }
    set gateway(value) {
        var _a, _b;
        const result = (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.Gateway) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('gateway', result);
    }
};
exports.SavePlanUser = SavePlanUser;
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => __1.SavePlanPmtTxn),
    __metadata("design:type", Array)
], SavePlanUser.prototype, "savePlanPmtTxns", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanUser.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanUser.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanUser.prototype, "deletedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, }),
    __metadata("design:type", Number)
], SavePlanUser.prototype, "version", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], SavePlanUser.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    (0, sequelize_typescript_1.ForeignKey)(() => __1.User),
    __metadata("design:type", String)
], SavePlanUser.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.Column,
    (0, sequelize_typescript_1.ForeignKey)(() => __1.SavePlan),
    __metadata("design:type", String)
], SavePlanUser.prototype, "saveplanId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], SavePlanUser.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(1000),
    }),
    __metadata("design:type", String)
], SavePlanUser.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BIGINT, }),
    __metadata("design:type", Number)
], SavePlanUser.prototype, "pmt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, }),
    __metadata("design:type", String)
], SavePlanUser.prototype, "frequency", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, }),
    __metadata("design:type", Number)
], SavePlanUser.prototype, "duration", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, }),
    __metadata("design:type", Number)
], SavePlanUser.prototype, "futureValue", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, }),
    __metadata("design:type", Number)
], SavePlanUser.prototype, "totalContributionAmt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, }),
    __metadata("design:type", Number)
], SavePlanUser.prototype, "interestRate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, }),
    __metadata("design:type", Number)
], SavePlanUser.prototype, "interestAmt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, }),
    __metadata("design:type", Number)
], SavePlanUser.prototype, "effectiveInterestRate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, }),
    __metadata("design:type", Number)
], SavePlanUser.prototype, "accruedInterest", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATEONLY, })
    /** Start date for this plan */
    ,
    __metadata("design:type", Date)
], SavePlanUser.prototype, "startDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATEONLY, })
    /** End date for this plan */
    ,
    __metadata("design:type", Date)
], SavePlanUser.prototype, "endDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATEONLY, })
    /** Next billing date for this plan */
    ,
    __metadata("design:type", Date)
], SavePlanUser.prototype, "nextBillingDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATEONLY, }),
    __metadata("design:type", Date)
], SavePlanUser.prototype, "lastInterestPayDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], SavePlanUser.prototype, "status", null);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], SavePlanUser.prototype, "gateway", null);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, }),
    __metadata("design:type", Number)
], SavePlanUser.prototype, "totalPaid", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DOUBLE, }),
    __metadata("design:type", Number)
], SavePlanUser.prototype, "totalPrincipal", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, }),
    __metadata("design:type", Boolean)
], SavePlanUser.prototype, "isLocked", void 0);
exports.SavePlanUser = SavePlanUser = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "saveplan_users",
        underscored: true,
        paranoid: true,
    })
], SavePlanUser);
