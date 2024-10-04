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
exports.BvnData = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const __1 = require("..");
let BvnData = class BvnData extends sequelize_typescript_1.Model {
    get bvnResponse() {
        return JSON.parse(this.getDataValue('bvnResponse'));
    }
    set bvnResponse(value) {
        this.setDataValue('bvnResponse', JSON.stringify(value));
    }
};
exports.BvnData = BvnData;
__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], BvnData.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
    }),
    (0, sequelize_typescript_1.ForeignKey)(() => __1.User),
    __metadata("design:type", String)
], BvnData.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => __1.User),
    __metadata("design:type", __1.User)
], BvnData.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(13),
        unique: true,
    }),
    __metadata("design:type", String)
], BvnData.prototype, "bvn", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, }),
    __metadata("design:type", Boolean)
], BvnData.prototype, "isVerified", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, }),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], BvnData.prototype, "bvnResponse", null);
exports.BvnData = BvnData = __decorate([
    (0, sequelize_typescript_1.Table)({
        paranoid: true,
        timestamps: true,
        tableName: "bvn_data",
        underscored: true
    })
], BvnData);
