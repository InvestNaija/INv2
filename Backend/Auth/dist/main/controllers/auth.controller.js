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
exports.AuthController = void 0;
const common_1 = require("@inv2/common");
const login_schema_1 = require("../validations/login.schema");
const services_1 = require("../services");
class AuthController {
    static signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // const profiler = Logger.logger.startTimer();
            try {
                const body = req.body;
                const authService = new services_1.AuthService;
                const user = yield authService.signup(body);
                res.status(user.code).json(user);
            }
            catch (error) {
                if (error instanceof common_1.CustomError)
                    next(new common_1.Exception(error));
            }
            // profiler.done({message: `Finished processing login request`});
            // console.log(cxn.postgres.manager.find(INUser));
        });
    }
}
exports.AuthController = AuthController;
__decorate([
    (0, common_1.JoiMWDecorator)(login_schema_1.AuthValidation.signup),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], AuthController, "signup", null);
