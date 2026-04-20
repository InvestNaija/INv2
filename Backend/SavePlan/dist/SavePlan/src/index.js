"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
// Initiate DB connection here
const domain_1 = require("./domain");
const common_1 = require("@inv2/common");
const rabbitmq_wrapper_1 = require("./rabbitmq.wrapper");
const redis_wrapper_1 = require("./redis.wrapper");
const listeners_1 = require("./events/listeners");
const client_1 = require("./grpc/client");
const PORT = parseInt(process.env.PORT) || 3000;
class Main {
    constructor(app) {
        this.app = app;
        this.grpcClient = new client_1.GrpcClient();
    }
    start() {
        this.init(this.app);
    }
    /*=============================================
    =            Server setup            =
    =============================================*/
    init(app) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, domain_1.setup)(); // Initialize the database connection
                const httpServer = new http_1.default.Server(app);
                yield this.createEventBus();
                yield this.startGrpc();
                this.startHttpServer(httpServer);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    createEventBus() {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis_wrapper_1.redisWrapper.connect(`redis://${process.env.REDIS_SERVER}`);
            yield rabbitmq_wrapper_1.rabbitmqWrapper.connect(`amqp://${process.env.RABBITMQ}`);
            common_1.INLogger.init('SavePlan', rabbitmq_wrapper_1.rabbitmqWrapper.connection);
            rabbitmq_wrapper_1.rabbitmqWrapper.connection.on('close', () => {
                console.log(`RabbitMQ connection closed!`);
                process.exit();
            });
            process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () { return yield rabbitmq_wrapper_1.rabbitmqWrapper.connection.close(); }));
            process.on('SIGTERM', () => __awaiter(this, void 0, void 0, function* () { return yield rabbitmq_wrapper_1.rabbitmqWrapper.connection.close(); }));
            // Set up all listeners
            yield (new listeners_1.UserCreatedListener(rabbitmq_wrapper_1.rabbitmqWrapper.connection)).listen();
            yield (new listeners_1.UserUpdatedListener(rabbitmq_wrapper_1.rabbitmqWrapper.connection)).listen();
        });
    }
    startHttpServer(httpServer) {
        return __awaiter(this, void 0, void 0, function* () {
            httpServer.listen(PORT, () => {
                common_1.INLogger.log.info(`Server running on port ${PORT}`);
            });
        });
    }
    startGrpc() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // await this.grpcClient.start(PORT);
                // Handle graceful shutdown
                // process.on('SIGINT', async () => await this.grpcServer.stop() );
                // process.on('SIGTERM', async () => await this.grpcServer.stop());
            }
            catch (error) {
                common_1.INLogger.log.error('Failed to start gRPC server:', error);
                throw error;
            }
        });
    }
}
exports.Main = Main;
const myApp = new Main(app_1.app);
myApp.start();
