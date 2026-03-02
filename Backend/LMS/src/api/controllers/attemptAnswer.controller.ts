import { Request, Response, NextFunction } from "express";
import { controller, httpGet, httpPost, httpPut, httpDelete } from "inversify-express-utils";
import { inject } from "inversify";
import { AttemptAnswerService } from "../../business/services/attemptAnswer.service";
import { Authentication, CustomError, Exception, JoiMWDecorator } from "@inv2/common";
import { AttemptAnswerValidation } from "../validations/attemptAnswer.schema";

@controller('/attempt-answers')
export class AttemptAnswerController {
    constructor(@inject(AttemptAnswerService) private attemptAnswerService: AttemptAnswerService) { }

    @httpPost('/', Authentication.requireAuth)
    @JoiMWDecorator(AttemptAnswerValidation.createAttemptAnswer)
    public async createAttemptAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const result = await this.attemptAnswerService.createAttemptAnswer(req.currentUser!, body);
            res.status(result.code).json(result);
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }

    @httpGet('/', Authentication.requireAuth)
    public async getAttemptAnswers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.query;
            const result = await this.attemptAnswerService.getAttemptAnswers(query);
            res.status(result.code).json(result);
        } catch (error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }

    @httpPut('/:id', Authentication.requireAuth)
    @JoiMWDecorator(AttemptAnswerValidation.updateAttemptAnswer)
    public async updateAttemptAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const id = req.params.id;
            const result = await this.attemptAnswerService.updateAttemptAnswer(id, req.currentUser!, body);
            res.status(result.code).json(result);
        } catch (error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }

    @httpDelete('/:id', Authentication.requireAuth)
    public async deleteAttemptAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            const result = await this.attemptAnswerService.deleteAttemptAnswer(id, req.currentUser!);
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
