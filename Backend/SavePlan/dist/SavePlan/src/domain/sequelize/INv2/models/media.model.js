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
exports.Media = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const common_1 = require("@inv2/common");
const __1 = require("..");
// const uppercaseFirst = str => `${str[0].toUpperCase()}${str.substr(1)}`;
let Media = class Media extends sequelize_typescript_1.Model {
    get type() {
        const rawValue = this.getDataValue('type');
        return common_1.DBEnums.MediaType.find(g => g.code === rawValue);
    }
    set type(value) {
        var _a, _b;
        const result = (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.MediaType) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == value || g.label == value || g.name == value))) === null || _b === void 0 ? void 0 : _b.code;
        this.setDataValue('type', result);
    }
    // getCommon(options: any) {
    //    if (!this.commonType) return Promise.resolve(null);
    //    const mixinMethodName = `get${uppercaseFirst(this.commonType)}`;
    //    return this[mixinMethodName](options);
    // }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static runAfterFind(findResult) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(findResult))
                findResult = [findResult];
            for (const instance of findResult) {
                if (instance.commonType === 'users' && instance.users !== undefined) {
                    instance.common = instance.users;
                }
                else if (instance.commonType === "txn_headers" && instance.txn_headers !== undefined) {
                    instance.common = instance.txn_headers;
                }
                // if(instance?.dataValues?.response) {
                //    let data = null;
                //    try {
                //       data = JSON.parse(instance?.dataValues?.response);
                //       const uploaderService = new CloudObjUploadService({service: data.service});
                //       const uploaded = await uploaderService.getFile(data);
                //       instance.setDataValue('response', uploaded.data);
                //    } catch (error) {
                //       // img = this.getDataValue('image')
                //    }
                // }
                // delete to prevent duplicates
                delete instance.users;
                delete instance.dataValues.users;
                delete instance.txn_headers;
                delete instance.dataValues.txn_headers;
            }
        });
    }
};
exports.Media = Media;
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => __1.User, { foreignKey: 'commonId', constraints: false }),
    __metadata("design:type", __1.User)
], Media.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], Media.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], Media.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, }),
    __metadata("design:type", Date)
], Media.prototype, "deletedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, }),
    __metadata("design:type", Number)
], Media.prototype, "version", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        primaryKey: true,
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
    }),
    __metadata("design:type", String)
], Media.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100) }),
    (0, sequelize_typescript_1.ForeignKey)(() => __1.User),
    __metadata("design:type", String)
], Media.prototype, "commonId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), }),
    __metadata("design:type", String)
], Media.prototype, "commonType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), }),
    __metadata("design:type", String)
], Media.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.SMALLINT, }),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], Media.prototype, "type", null);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), }),
    __metadata("design:type", String)
], Media.prototype, "mime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, }),
    __metadata("design:type", Number)
], Media.prototype, "size", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, }),
    __metadata("design:type", String)
], Media.prototype, "resource", void 0);
__decorate([
    sequelize_typescript_1.AfterFind
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], Media, "runAfterFind", null);
exports.Media = Media = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "media",
        underscored: true,
        paranoid: true,
    })
], Media);
// export default {User};
