"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
class AuthRoutes {
    constructor() {
        this.router = express_1.default.Router();
    }
    routes() {
        this.router.post('/user/signup', controllers_1.AuthController.signup);
        // this.router.post('/user/login', AuthController.login);
        // this.router.get('/get-apps/:device_id', authMiddleware.checkAuthentication, Get.prototype.read);
        // this.router.post('/update-app-status', authMiddleware.checkAuthentication, Update.prototype.updateStatus);
        return this.router;
    }
}
exports.authRoutes = new AuthRoutes();
