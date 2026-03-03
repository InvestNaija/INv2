import { Request, Response, NextFunction } from "express";
import { controller, httpGet, httpPost, httpPut, httpDelete } from "inversify-express-utils";
import { inject } from "inversify";
import { QuestionAnswerService } from "../../business/services/questionAnswer.service";
import { Authentication, CustomError, Exception, JoiMWDecorator } from "@inv2/common";
import { QuestionAnswerValidation } from "../validations/questionAnswer.schema";

@controller('/question-answers')
export class QuestionAnswerController {
    constructor(@inject(QuestionAnswerService) private questionAnswerService: QuestionAnswerService) { }

    @httpPost('/', Authentication.requireAuth)
    @JoiMWDecorator(QuestionAnswerValidation.createQuestionAnswer)
    public async createQuestionAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const result = await this.questionAnswerService.createQuestionAnswer(req.currentUser!, body);
            res.status(result.code).json(result);
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }

    @httpGet('/', Authentication.requireAuth)
    public async getQuestionAnswers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.query;
            const result = await this.questionAnswerService.getQuestionAnswers(query);
            res.status(result.code).json(result);
        } catch (error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }

    @httpPut('/:id', Authentication.requireAuth)
    @JoiMWDecorator(QuestionAnswerValidation.updateQuestionAnswer)
    public async updateQuestionAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const id = req.params.id;
            const result = await this.questionAnswerService.updateQuestionAnswer(id, req.currentUser!, body);
            res.status(result.code).json(result);
        } catch (error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }

    @httpDelete('/:id', Authentication.requireAuth)
    public async deleteQuestionAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            const result = await this.questionAnswerService.deleteQuestionAnswer(id, req.currentUser!);
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
