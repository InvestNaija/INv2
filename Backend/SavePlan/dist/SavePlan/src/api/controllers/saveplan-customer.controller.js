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
exports.CustomerSaveplanController = void 0;
const inversify_express_utils_1 = require("inversify-express-utils");
const common_1 = require("@inv2/common");
// import { AuthValidation } from '../validations/auth.schema';
const services_1 = require("../../business/services");
const customer_schema_1 = require("../validations/customer.schema");
let CustomerSaveplanController = class CustomerSaveplanController {
    constructor(customerSvc) {
        this.customerSvc = customerSvc;
    }
    healthz(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.status(200).json({ status: 200, message: "SavePlan server is Healthy" });
        });
    }
    list(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(req?.currentUser);
            const profiler = common_1.INLogger.log.startTimer();
            try {
                const user = yield this.customerSvc.list(req.params.type);
                res.status(user.code).json(user);
                profiler.done({ service: `SavePlan`, message: `Finished processing login request` });
            }
            catch (error) {
                next(new common_1.Exception((0, common_1.handleError)(error)));
            }
        });
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const profiler = common_1.INLogger.log.startTimer();
            try {
                const body = req.body;
                const saveplan = yield this.customerSvc.create(req.currentUser, body);
                res.status(saveplan.code).json(saveplan);
                profiler.done({ service: `SavePlan`, message: `Finished processing login request` });
            }
            catch (error) {
                next(new common_1.Exception((0, common_1.handleError)(error)));
            }
        });
    }
};
exports.CustomerSaveplanController = CustomerSaveplanController;
__decorate([
    (0, inversify_express_utils_1.httpGet)('/healthz'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerSaveplanController.prototype, "healthz", null);
__decorate([
    (0, inversify_express_utils_1.httpGet)("/:type?"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], CustomerSaveplanController.prototype, "list", null);
__decorate([
    (0, common_1.JoiMWDecorator)(customer_schema_1.CustomerSavePlanValidation.create),
    (0, inversify_express_utils_1.httpPost)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], CustomerSaveplanController.prototype, "create", null);
exports.CustomerSaveplanController = CustomerSaveplanController = __decorate([
    (0, inversify_express_utils_1.controller)("/customer/saveplan"),
    __metadata("design:paramtypes", [services_1.CustomerSaveplanService])
], CustomerSaveplanController);
