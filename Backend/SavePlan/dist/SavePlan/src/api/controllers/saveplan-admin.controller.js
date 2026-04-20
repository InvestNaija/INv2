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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.AdminSaveplanController = void 0;
const inversify_express_utils_1 = require("inversify-express-utils");
const common_1 = require("@inv2/common");
const services_1 = require("../../business/services");
const admin_schema_1 = require("../validations/admin.schema");
// import { NotificationFactory } from '../../business/services/notification/factory/notification.factory';
// import { BaseNotificationFactory } from '../../business/services/notification/factory/base-notification.factory';
// import { Notification } from '../../business/services/notification/factory/notification';
// import { NotificationType } from '../../business/services/notification/INotifiable';
let AdminSaveplanController = class AdminSaveplanController {
    constructor(adminSvc) {
        this.adminSvc = adminSvc;
    }
    list(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const profiler = common_1.INLogger.log.startTimer();
            try {
                const saveplan = yield this.adminSvc.list(req.params.type);
                res.status(saveplan.code).json(saveplan);
                profiler.done({ service: `SavePlan`, message: `List of saveplas retrieved successfully` });
            }
            catch (error) {
                next(new common_1.Exception((0, common_1.handleError)(error)));
            }
        });
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // const svc = new Notification(
            //    [ NotificationType.EMAIL, NotificationType.SMS ],
            //    {
            //       from: { firstName: 'InvestNaija', email: 'noreply@investnaija.com', phone: '+2347065725667' },
            //       to: [{firstName: 'Abimbola', email: 'infinitizon@gmail.com', phone: '+2347065725667'},{firstName: 'Juwon', email: 'abimbola.d.hassan@gmail.com', phone: '+2347065725667'}],
            //       message: "This is a test message"
            //    }
            // );
            // svc.attachments = ['wer',456];
            // const notyFactory: BaseNotificationFactory[] = new NotificationFactory().createFactory(svc);
            // notyFactory.forEach(noty=>noty.notify());
            const profiler = common_1.INLogger.log.startTimer();
            try {
                const saveplan = yield this.adminSvc.create(req.body);
                res.status(saveplan.code).json(saveplan);
                profiler.done({ service: `SavePlan`, message: `New SavePlan created successfully => ${JSON.stringify(saveplan.data)}` });
            }
            catch (error) {
                next(new common_1.Exception((0, common_1.handleError)(error)));
            }
        });
    }
    update(id, body, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const profiler = common_1.INLogger.log.startTimer();
            try {
                const saveplan = yield this.adminSvc.update(id, body);
                res.status(saveplan.code).json(saveplan);
                profiler.done({ service: `SavePlan`, level: 'info', message: `Update SavePlan with id ${id} successfully` });
            }
            catch (error) {
                next(new common_1.Exception((0, common_1.handleError)(error)));
            }
        });
    }
};
exports.AdminSaveplanController = AdminSaveplanController;
__decorate([
    (0, inversify_express_utils_1.httpGet)("/:type?"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], AdminSaveplanController.prototype, "list", null);
__decorate([
    (0, common_1.JoiMWDecorator)(admin_schema_1.AdminValidation.create),
    (0, inversify_express_utils_1.httpPost)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], AdminSaveplanController.prototype, "create", null);
__decorate([
    (0, common_1.JoiMWDecorator)(admin_schema_1.AdminValidation.update),
    (0, inversify_express_utils_1.httpPatch)("/:saveplanId"),
    __param(0, (0, inversify_express_utils_1.requestParam)("saveplanId")),
    __param(1, (0, inversify_express_utils_1.requestBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Function]),
    __metadata("design:returntype", Promise)
], AdminSaveplanController.prototype, "update", null);
exports.AdminSaveplanController = AdminSaveplanController = __decorate([
    (0, inversify_express_utils_1.controller)("/admin/saveplan"),
    __metadata("design:paramtypes", [services_1.AdminService])
], AdminSaveplanController);
