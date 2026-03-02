import { NextFunction, Request, Response } from 'express';
import { Exception, CustomError, JoiMWDecorator, Authentication } from "@inv2/common";
import { QuizQuestionValidation } from '../validations/quizQuestion.schema';
import { QuizQuestionService } from '../../business/services';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';

@controller('/quiz-questions')
export class QuizQuestionController {

    constructor(private readonly quizQuestionService: QuizQuestionService) { }

    @httpPost('/', Authentication.requireAuth)
    @JoiMWDecorator(QuizQuestionValidation.createQuizQuestion)
    public async createQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const result = await this.quizQuestionService.createQuizQuestion(req.currentUser!, body);
            res.status(result.code).json(result);
        } catch (error: unknown | Error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }

    @httpPut('/:id', Authentication.requireAuth)
    @JoiMWDecorator(QuizQuestionValidation.updateQuizQuestion)
    public async updateQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const id = req.params.id;
            const result = await this.quizQuestionService.updateQuizQuestion(id, req.currentUser!, body);
            res.status(result.code).json(result);
        } catch (error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }

    @httpGet('/', Authentication.requireAuth)
    public async getQuizQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.query;
            const result = await this.quizQuestionService.getQuizQuestions(query);
            res.status(result.code).json(result);
        } catch (error) {
            if (error instanceof CustomError) next(new Exception(error));
            else next(error);
        }
    }

    @httpDelete('/:id', Authentication.requireAuth)
    public async deleteQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            const result = await this.quizQuestionService.deleteQuizQuestion(id, req.currentUser!);
            // For 204 No Content, send status without body
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
