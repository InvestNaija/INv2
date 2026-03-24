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
exports.SavePlanGLEntity = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const DBEnums_1 = require("../../../DBEnums");
const __1 = require("..");
let SavePlanGLEntity = class SavePlanGLEntity extends sequelize_typescript_1.Model {
    get glType() {
        const rawValue = this.getDataValue('glType');
        return DBEnums_1.DBEnums.GLEntityType.find(g => g.code === rawValue);
    }
    set glType(value) {
        var _a, _b;
        const result = (_b = (_a = DBEnums_1.DBEnums === null || DBEnums_1.DBEnums === void 0 ? void 0 : DBEnums_1.DBEnums.GLEntityType) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('glType', result);
    }
};
exports.SavePlanGLEntity = SavePlanGLEntity;
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => __1.SavePlan),
    __metadata("design:type", __1.SavePlan)
], SavePlanGLEntity.prototype, "saveplan", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => __1.SavePlanAssetBank),
    __metadata("design:type", Array)
], SavePlanGLEntity.prototype, "savePlanAssetBanks", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanGLEntity.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanGLEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], SavePlanGLEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, }),
    __metadata("design:type", Number)
], SavePlanGLEntity.prototype, "version", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], SavePlanGLEntity.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    (0, sequelize_typescript_1.ForeignKey)(() => __1.SavePlan),
    __metadata("design:type", String)
], SavePlanGLEntity.prototype, "saveplanId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(30), }),
    __metadata("design:type", String)
], SavePlanGLEntity.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, }),
    __metadata("design:type", String)
], SavePlanGLEntity.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Number)
], SavePlanGLEntity.prototype, "rate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], SavePlanGLEntity.prototype, "glType", null);
exports.SavePlanGLEntity = SavePlanGLEntity = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "saveplan_gl_entities",
        underscored: true,
        paranoid: true,
    })
], SavePlanGLEntity);
