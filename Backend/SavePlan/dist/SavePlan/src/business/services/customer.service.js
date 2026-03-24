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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSaveplanService = void 0;
const inversify_1 = require("inversify");
const moment_1 = __importDefault(require("moment"));
const common_1 = require("@inv2/common");
const INv2_1 = require("../../domain/sequelize/INv2");
const types_1 = require("../types");
const calculator_service_1 = require("./calculator.service");
let CustomerSaveplanService = class CustomerSaveplanService {
    constructor(saveplanRepo) {
        this.saveplanRepo = saveplanRepo;
    }
    list(type) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // try {
            const saveplans = yield INv2_1.SavePlan.findAndCountAll({
                attributes: ["id", "title", "slug", "type", "calculator", "currency", "interestRate", "minDuration", "maxDuration"],
                where: Object.assign({}, (type && { type: (_b = (_a = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.SaveplanType) === null || _a === void 0 ? void 0 : _a.find(g => (g.code == type || g.label == type || g.name == type))) === null || _b === void 0 ? void 0 : _b.code }))
            });
            return { success: true, code: 200, message: `SavePlans retrieved successfully`, count: saveplans.count, data: saveplans.rows };
            // } catch (error) {
            //    throw new Exception(handleError(error));
            // }
        });
    }
    /**
     * Creates a new SavePlan subscription for a customer.
     *
     * This method performs several steps:
     * 1. Validates the existence of the base SavePlan product.
     * 2. Calculates the end date based on the provided duration or a custom end date.
     * 3. Uses the Calculator utility to project financial metrics (PMT, future value, interest).
     * 4. Persists the subscription details to the SavePlanUser table.
     *
     * @param currentUser The authenticated user initiate the request
     * @param body The payload containing specific plan parameters (productId, amount, duration, frequency, etc.)
     * @returns A promise resolving to an IResponse object
     */
    create(currentUser, body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                // 1. Fetch the base SavePlan product to get defaults (interest rate, calculator type, etc.)
                const product = yield INv2_1.SavePlan.findByPk(body.productId);
                if (!product)
                    throw new common_1.Exception({ code: 404, message: `SavePlan product not found` });
                // 2. Handle Date Calculations
                // If the user chooses a predefined duration, we add those months to the start date.
                // Otherwise, we use the customEndDate provided by the user.
                let startDate = (0, moment_1.default)(body.startDate);
                let endDate;
                if (body.duration === 'choose' || body.custom) {
                    if (!body.customEndDate)
                        throw new common_1.Exception({ code: 400, message: `Custom end date is required for this plan` });
                    endDate = (0, moment_1.default)(body.customEndDate);
                }
                else {
                    const durationMonths = typeof body.duration === 'string' ? parseInt(body.duration) : body.duration;
                    endDate = (0, moment_1.default)(body.startDate).add(durationMonths, 'months');
                }
                // Ensure the end date is after the start date
                if (endDate.isBefore(startDate)) {
                    throw new common_1.Exception({ code: 400, message: `End date must be after start date` });
                }
                // 3. Perform Financial Calculations
                // We use the Calculator helper to determine the PMT (payment), future value, and interest earned.
                // The choice of calculation method depends on the product's calculator type (e.g., 'plan' vs 'compounding').
                let calculations;
                const interestRate = Number(product.interestRate);
                const frequency = body.frequency;
                const initialAmt = Number(body.initialAmt || 0);
                const targetAmount = Number(body.amount);
                const calcType = (_b = (_a = product.calculator) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.toLowerCase();
                if (calcType === 'plan' || calcType === 'planin') {
                    // "Plan" tells the user how much to save periodically to reach a target future value.
                    calculations = calculator_service_1.Calculator.plan(initialAmt, targetAmount, frequency, interestRate, startDate.toDate(), endDate.toDate());
                }
                else {
                    // "Compounding" (SaveIn) calculates the future value based on recurring payments.
                    calculations = calculator_service_1.Calculator.compounding(initialAmt, targetAmount, // Here, 'amount' is treated as the PMT (periodic payment)
                    frequency, interestRate, startDate.toDate(), endDate.toDate());
                }
                // 4. Persist the User's SavePlan record
                // We store all projected fields and the current status.
                const saveplanUser = yield INv2_1.SavePlanUser.create({
                    saveplanId: product.id,
                    userId: currentUser.user.id,
                    title: body.custom ? body.title : product.title,
                    description: body.custom ? `Custom Plan: ${body.title}` : `Subscription to ${product.title}`,
                    pmt: calculations.PMT,
                    frequency: frequency,
                    duration: typeof body.duration === 'number' ? body.duration : (body.duration === 'choose' ? endDate.diff(startDate, 'months') : parseInt(body.duration)),
                    futureValue: calculations.future_value,
                    totalContributionAmt: calculations.total_contribution_amount,
                    interestRate: interestRate,
                    interestAmt: calculations.interest_earned,
                    effectiveInterestRate: calculations.effective_interest_rate,
                    startDate: startDate.toDate(),
                    endDate: endDate.toDate(),
                    nextBillingDate: startDate.toDate(), // Initial billing starts on the start date
                    status: ((_d = (_c = common_1.DBEnums === null || common_1.DBEnums === void 0 ? void 0 : common_1.DBEnums.OrderStatus) === null || _c === void 0 ? void 0 : _c.find(g => (g.name === 'inprogress' || g.label === 'inprogress'))) === null || _d === void 0 ? void 0 : _d.code) || 104,
                    gateway: body.gateway,
                    totalPaid: 0,
                    totalPrincipal: 0,
                    isLocked: false,
                });
                // 5. Handle Initial Transaction (If applicable)
                // If the plan starts today, we create a pending transaction record to initiate the first payment.
                if (startDate.isSame((0, moment_1.default)(), 'day')) {
                    const transactionReference = common_1.Helper.genRandomCode(20, { includeNumbers: true, includeUpperChars: true, isUnique: true });
                    yield INv2_1.SavePlanPmtTxn.create({
                        saveplanUserId: saveplanUser.id,
                        amount: initialAmt > 0 ? initialAmt : calculations.PMT,
                        reference: transactionReference,
                        status: 'pending',
                        description: saveplanUser.description,
                        type: 'credit', // Initial funding is a credit to the plan
                        postDate: new Date(),
                    });
                    common_1.INLogger.log.info(`Initial transaction created for SavePlan ${saveplanUser.id} with reference ${transactionReference}`);
                }
                common_1.INLogger.log.info(`New SavePlan subscription created for user ${currentUser.user.id} => ${saveplanUser.id}`);
                return {
                    success: true,
                    code: 201,
                    message: `SavePlan '${saveplanUser.title}' created successfully`,
                    data: {
                        plan: saveplanUser,
                        calculations: calculations
                    }
                };
            }
            catch (error) {
                // Standardize error handling using the common utility
                throw new common_1.Exception((0, common_1.handleError)(error));
            }
        });
    }
};
exports.CustomerSaveplanService = CustomerSaveplanService;
exports.CustomerSaveplanService = CustomerSaveplanService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ISavePlanRepository)),
    __metadata("design:paramtypes", [Object])
], CustomerSaveplanService);
