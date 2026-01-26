import { controller, httpGet, httpPost, httpPut, httpDelete } from "inversify-express-utils";
import { NextFunction, Request, Response } from "express";
import { Exception, CustomError, JoiMWDecorator, INLogger, Authentication } from "@inv2/common";
import { QuizValidation } from "../validations/lms.schema";
import { QuizService } from "../../business/services";

@controller("/quiz")
export class QuizController {
    constructor(private readonly quizSvc: QuizService) {}

    @httpGet("/health")
    public async healthz(req: Request, res: Response, next: NextFunction): Promise<void> {
        res.status(200).json({ status: "Quiz Service is healthy" });
    }

    @httpPost("/", Authentication.requireAuth)
    @JoiMWDecorator(QuizValidation.createQuiz)
    public async createQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const body = req.body;
            const currentUser = req.currentUser!;
            const quiz = await this.quizSvc.createQuiz(currentUser, body);
            res.status(quiz.code).json(quiz);
            profiler.done({ service: `LMS`, message: `Create Quiz successful. Quiz: ${JSON.stringify(quiz.data)}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }

    // Additional endpoints (update, get by id, get all, delete) would be implemented similarly
    @httpPut("/:id", Authentication.requireAuth)
    @JoiMWDecorator(QuizValidation.updateQuiz)
    public async updateQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const body = req.body;
            const currentUser = req.currentUser!;
            const quiz = await this.quizSvc.updateQuiz(req.params.id, body);
            res.status(quiz.code).json(quiz);
            profiler.done({ service: `LMS`, message: `Update Quiz successful. Quiz: ${JSON.stringify(quiz.data)}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }

    @httpGet("/:id", Authentication.requireAuth)
    public async getQuizById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const currentUser = req.currentUser!;
            const quiz = await this.quizSvc.getQuizById(req.params.id);
            res.status(quiz.code).json(quiz);
            profiler.done({ service: `LMS`, message: `Get Quiz by ID successful. Quiz: ${JSON.stringify(quiz.data)}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }

    @httpGet("/", Authentication.requireAuth)
    public async getAllQuizzes(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const currentUser = req.currentUser!;
            const quizzes = await this.quizSvc.getQuizzes(req.query);
            res.status(quizzes.code).json(quizzes);
            profiler.done({ service: `LMS`, message: `Get All Quizzes successful. Quizzes count: ${quizzes.data.length}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }

    @httpDelete("/:id", Authentication.requireAuth)
    public async deleteQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const currentUser = req.currentUser!;
            const quiz = await this.quizSvc.deleteQuiz(req.params.id);
            res.status(quiz.code).json(quiz);
            profiler.done({ service: `LMS`, message: `Delete Quiz successful. Quiz ID deleted was ${req.params.id}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }
}