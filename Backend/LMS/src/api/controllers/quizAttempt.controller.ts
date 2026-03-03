import { Request, Response, NextFunction } from "express";
import { controller, httpGet, httpPost, httpPut, httpDelete } from "inversify-express-utils";
import { inject } from "inversify";
import { QuizAttemptService } from "../../business/services/quizAttempt.service";
import { Authentication, CustomError, Exception, JoiMWDecorator } from "@inv2/common";
import { QuizAttemptValidation } from "../validations/quizAttempt.schema";

@controller('/quiz-attempts')
export class QuizAttemptController {
    constructor(@inject(QuizAttemptService) private quizAttemptService: QuizAttemptService) { }

    @httpPost('/', Authentication.requireAuth)
    @JoiMWDecorator(QuizAttemptValidation.createQuizAttempt)
    public async createQuizAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            if (!body.attemptIp) {
                body.attemptIp = req.socket.remoteAddress || req.ip || "0.0.0.0";
            }
            const result = await this.quizAttemptService.createQuizAttempt(req.currentUser!, body);
            res.status(result.code).json(result);
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }

    @httpGet('/', Authentication.requireAuth)
    public async getQuizAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.query;
            const result = await this.quizAttemptService.getQuizAttempts(query);
            res.status(result.code).json(result);
        } catch (error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }

    @httpPut('/:id', Authentication.requireAuth)
    @JoiMWDecorator(QuizAttemptValidation.updateQuizAttempt)
    public async updateQuizAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const id = req.params.id;
            const result = await this.quizAttemptService.updateQuizAttempt(id, req.currentUser!, body);
            res.status(result.code).json(result);
        } catch (error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }

    @httpDelete('/:id', Authentication.requireAuth)
    public async deleteQuizAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            const result = await this.quizAttemptService.deleteQuizAttempt(id, req.currentUser!);
            if (result.code === 204) {
                res.status(204).send();
            } else {
                res.status(result.code).json(result);
            }
        } catch (error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }
}
