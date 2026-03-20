"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = require("express");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const common_1 = require("@inv2/common");
const inversify_express_utils_1 = require("inversify-express-utils");
require("./api/controllers");
const inversify_config_1 = require("./inversify.config");
const server = new inversify_express_utils_1.InversifyExpressServer(inversify_config_1.container, null, { rootPath: "/api/v2/po" });
server.setConfig(app => {
    /*===============================
     * Initiate all middlewares except error
    =================================*/
    app.set('trust proxy', true);
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: '*',
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }));
    // Authentication
    app.use(common_1.Authentication.currentUser);
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '50mb' }));
});
server.setErrorConfig((app) => {
    app.use((req, res) => {
        res.status(404).json({ message: `${req.ip} tried to ${req.method} to a resource at ${req.originalUrl} that is not on this server.` });
    });
    // Global Error middleware 
    app.use(common_1.errorHandler);
});
const app = server.build();
exports.app = app;
