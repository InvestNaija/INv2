"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importStar(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const index_routes_1 = __importDefault(require("./main/routes/index.routes"));
const common_1 = require("@inv2/common");
const app = (0, express_1.default)();
exports.app = app;
/*===============================
 * Initiate Security middlewares *
=================================*/
app.set('trust proxy', true);
//   app.use(hpp());
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
/*====================================
* Initiate standard middlewares *
====================================*/
app.use(common_1.currentUser);
//   app.use(compression());
app.use((0, express_1.json)({ limit: '50mb' }));
app.use((0, express_1.urlencoded)({ extended: true, limit: '50mb' }));
/*===================================
*           Load the routes         =
====================================*/
//logging for routes
// if (config.NODE_ENV !== 'test') {
//    app.use(morgan.successHandler);
//    app.use(morgan.errorHandler);
// }
(0, index_routes_1.default)(app);
/*=============================================
=         Global Error middleware            =
=============================================*/
app.use((req, res) => {
    res.status(404).json({ message: `${req.ip} tried to ${req.method} to a resource at ${req.originalUrl} that is not on this server.` });
});
app.use(common_1.errorHandler);
