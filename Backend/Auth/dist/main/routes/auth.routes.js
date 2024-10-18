"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const common_1 = require("@inv2/common");
class AuthRoutes {
    constructor() {
        this.router = express_1.default.Router();
    }
    routes() {
        this.router.get('/healthz', controllers_1.AuthController.healthz);
        this.router.post('/user/signup', controllers_1.AuthController.signup);
        this.router.post('/user/signin', auth_middleware_1.AuthMiddleware.checkLoginDetails, auth_middleware_1.AuthMiddleware.check2FA, controllers_1.AuthController.signin);
        this.router.post('/user/signin-choose-tenant', auth_middleware_1.AuthMiddleware.checkLoginDetails, controllers_1.AuthController.signin);
        this.router.post('/user/set-2FA', common_1.requireAuth, controllers_1.AuthController.set2FA);
        this.router.post('/user/signout', common_1.requireAuth, controllers_1.AuthController.set2FA);
        // this.router.get('/get-apps/:device_id', authMiddleware.checkAuthentication, Get.prototype.read);
        // this.router.post('/update-app-status', authMiddleware.checkAuthentication, Update.prototype.updateStatus);
        return this.router;
    }
}
exports.authRoutes = new AuthRoutes();
