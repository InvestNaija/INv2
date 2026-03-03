import { controller, httpGet, httpPost, httpPut, httpDelete } from "inversify-express-utils";
import { NextFunction, Request, Response } from "express";
import { Exception, CustomError, JoiMWDecorator, INLogger, Authentication } from "@inv2/common";
import { QuestionValidation } from "../validations/question.schema";
import { QuestionService } from "../../business/services";

@controller("/question")
export class QuestionController {
    constructor(private readonly questionSvc: QuestionService) { }

    @httpGet("/health")
    public async healthz(req: Request, res: Response, next: NextFunction): Promise<void> {
        res.status(200).json({ status: "Question Service is healthy" });
    }

    @httpGet("/question-types", Authentication.requireAuth)
    public async getQuestionTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const questionTypes = await this.questionSvc.getQuestionTypes();
            res.status(questionTypes.code).json(questionTypes);
            profiler.done({ service: `LMS`, message: `Get Question Types successful. Question Types count: ${questionTypes.data.length}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }

    @httpPost("/", Authentication.requireAuth)
    @JoiMWDecorator(QuestionValidation.createQuestion)
    public async createQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const body = req.body;
            const currentUser = req.currentUser!;
            const question = await this.questionSvc.createQuestion(currentUser, body);
            res.status(question.code).json(question);
            profiler.done({ service: `LMS`, message: `Create Question successful. Question: ${JSON.stringify(question.data)}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }

    @httpPut("/:id", Authentication.requireAuth)
    @JoiMWDecorator(QuestionValidation.updateQuestion)
    public async updateQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const body = req.body;
            const currentUser = req.currentUser!;
            const question = await this.questionSvc.updateQuestion(req.params.id, body);
            res.status(question.code).json(question);
            profiler.done({ service: `LMS`, message: `Update Question successful. Question: ${JSON.stringify(question.data)}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }

    @httpGet("/:id", Authentication.requireAuth)
    public async getQuestionById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const currentUser = req.currentUser!;
            const question = await this.questionSvc.getQuestionById(req.params.id);
            res.status(question.code).json(question);
            profiler.done({ service: `LMS`, message: `Get Question by ID successful. Question: ${JSON.stringify(question.data)}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }

    @httpGet("/", Authentication.requireAuth)
    public async getAllQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const currentUser = req.currentUser!;
            const questions = await this.questionSvc.getQuestions(req.query);
            res.status(questions.code).json(questions);
            profiler.done({ service: `LMS`, message: `Get All Questions successful. Questions count: ${questions.data.length}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }



    @httpDelete("/:id", Authentication.requireAuth)
    public async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
        const profiler = INLogger.log.startTimer();
        try {
            const currentUser = req.currentUser!;
            const question = await this.questionSvc.deleteQuestion(req.params.id);
            res.status(question.code).json(question);
            profiler.done({ service: `LMS`, message: `Delete Question successful. Question ID deleted was ${req.params.id}` });
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) {
                next(error);
            } else {
                next(new Exception({ code: 500, message: "An unexpected error occurred" }));
            }
        }
    }
}
