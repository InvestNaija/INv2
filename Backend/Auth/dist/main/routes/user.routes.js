"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
// import { UserController } from '../controllers/user.controller';
class UserRoutes {
    constructor() {
        this.router = express_1.default.Router();
    }
    routes() {
        // this.router.post('/', Create.prototype.create);
        // this.router.get('/', UserController.login);
        // this.router.get('/get-apps/:device_id', authMiddleware.checkAuthentication, Get.prototype.read);
        // this.router.post('/update-app-status', authMiddleware.checkAuthentication, Update.prototype.updateStatus);
        return this.router;
    }
}
exports.userRoutes = new UserRoutes();
