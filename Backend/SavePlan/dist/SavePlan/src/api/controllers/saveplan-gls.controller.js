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
exports.SaveplanGlController = void 0;
const inversify_express_utils_1 = require("inversify-express-utils");
const common_1 = require("@inv2/common");
const services_1 = require("../../business/services");
const admin_schema_1 = require("../validations/admin.schema");
// import { NotificationFactory } from '../../business/services/notification/factory/notification.factory';
// import { BaseNotificationFactory } from '../../business/services/notification/factory/base-notification.factory';
// import { Notification } from '../../business/services/notification/factory/notification';
// import { NotificationType } from '../../business/services/notification/INotifiable';
let SaveplanGlController = class SaveplanGlController {
    constructor(glSvc) {
        this.glSvc = glSvc;
    }
    // router.post('/create', controller.create);
    // router.put('/update/:id', controller.update);
    // router.delete('/delete/:id', controller.delete);
    // router.get('/get-one/:id', controller.getOne);
    // router.get('/get-all/:saveplan_id', controller.getAll);\
    // router.get('/get-all-transaction-type', controller.getGLTxnType)
    createGls(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const profiler = common_1.INLogger.log.startTimer();
            try {
                const saveplan = yield this.glSvc.create(req.params.saveplanId, req.body);
                res.status(saveplan.code).json(saveplan);
                profiler.done({ service: `SavePlan`, message: `New SavePlan created successfully => ${JSON.stringify(saveplan.data)}` });
            }
            catch (error) {
                next(new common_1.Exception((0, common_1.handleError)(error)));
            }
        });
    }
    getGls(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const profiler = common_1.INLogger.log.startTimer();
            try {
                const gls = yield this.glSvc.findAll(req.params.saveplanId);
                res.status(gls.code).json(gls);
                profiler.done({ service: `SavePlan`, message: `GLs for saveplan: ${req.params.saveplanId} fetched successfully => ${JSON.stringify(gls.data)}` });
            }
            catch (error) {
                next(new common_1.Exception((0, common_1.handleError)(error)));
            }
        });
    }
    getGl(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const profiler = common_1.INLogger.log.startTimer();
            try {
                const gl = yield this.glSvc.findOne(req.params.id);
                res.status(gl.code).json(gl);
                profiler.done({ service: `SavePlan`, message: `Gl with id: ${req.params.id} fetched successfully => ${JSON.stringify(gl.data)}` });
            }
            catch (error) {
                next(new common_1.Exception((0, common_1.handleError)(error)));
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const profiler = common_1.INLogger.log.startTimer();
            try {
                const gl = yield this.glSvc.update(req.params.id, req.body);
                res.status(gl.code).json(gl);
                profiler.done({ service: `SavePlan`, level: 'info', message: `Updated GL with id: ${req.params.id} successfully` });
            }
            catch (error) {
                next(new common_1.Exception((0, common_1.handleError)(error)));
            }
        });
    }
};
exports.SaveplanGlController = SaveplanGlController;
__decorate([
    (0, common_1.JoiMWDecorator)(admin_schema_1.AdminValidation.create),
    (0, inversify_express_utils_1.httpPost)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], SaveplanGlController.prototype, "createGls", null);
__decorate([
    (0, inversify_express_utils_1.httpGet)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], SaveplanGlController.prototype, "getGls", null);
__decorate([
    (0, inversify_express_utils_1.httpGet)("/:id"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], SaveplanGlController.prototype, "getGl", null);
__decorate([
    (0, common_1.JoiMWDecorator)(admin_schema_1.AdminValidation.update),
    (0, inversify_express_utils_1.httpPatch)("/:id"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], SaveplanGlController.prototype, "update", null);
exports.SaveplanGlController = SaveplanGlController = __decorate([
    (0, inversify_express_utils_1.controller)("/admin/saveplan/:saveplanId/gls"),
    __metadata("design:paramtypes", [services_1.GlService])
], SaveplanGlController);
