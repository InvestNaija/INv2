import { inject, injectable } from "inversify";
import { IResponse, Exception, UserTenantRoleDto, CustomError, DBEnums } from "@inv2/common";
import { Transaction, ValidationError, DatabaseError } from "sequelize";
import { QuestionDto } from "../../api/dtos";
import { TYPES } from "../types";
import { IQuestionRepository } from "../repositories";

@injectable()
export class QuestionService {
    constructor(
        @inject(TYPES.IQuestionRepository)
        private readonly questionRepo: IQuestionRepository
    ) { }

    async createQuestion(currentUser: Partial<UserTenantRoleDto>, data: Partial<QuestionDto>, transaction?: Transaction): Promise<IResponse> {
        const t = transaction ?? await this.questionRepo.transaction();
        try {
            const createdQuestion = await this.questionRepo.createQuestion(data, t);
            if (!transaction) await this.questionRepo.commit(t);
            return { success: true, code: 201, message: "Question created successfully", data: createdQuestion };
        } catch (error) {
            if (!transaction) await this.questionRepo.rollback(t);
            return this.handleError(error);
        }
    }

    async updateQuestion(id: string, data: Partial<QuestionDto>, transaction?: Transaction): Promise<IResponse> {
        const t = transaction ?? await this.questionRepo.transaction();
        try {
            const question = await this.questionRepo.getQuestionById(id, t);
            if (!question) throw new Exception({ code: 404, message: "Question not found" });

            await this.questionRepo.updateQuestion(id, data, t);
            const updatedQuestion = await this.questionRepo.getQuestionById(id, t);
            if (!transaction) await this.questionRepo.commit(t);
            return { success: true, code: 200, message: "Question updated successfully", data: updatedQuestion };
        } catch (error) {
            if (!transaction) await this.questionRepo.rollback(t);
            return this.handleError(error);
        }
    }

    async getQuestionById(id: string, transaction?: Transaction): Promise<IResponse> {
        try {
            const question = await this.questionRepo.getQuestionById(id, transaction);
            if (!question) throw new Exception({ code: 404, message: "Question not found" });

            return { success: true, code: 200, message: "Question retrieved successfully", data: question };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getQuestions(filter: any, transaction?: Transaction): Promise<IResponse> {
        try {
            const questions = await this.questionRepo.getQuestions(filter, transaction);
            return { success: true, code: 200, message: "Questions retrieved successfully", data: questions };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getQuestionTypes(transaction?: Transaction): Promise<IResponse> {
        try {
            const questionTypes = DBEnums.QuestionType.map((type) => {
                return {
                    code: type.code,
                    name: type.label
                };
            });
            return { success: true, code: 200, message: "Question types retrieved successfully", data: questionTypes };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async deleteQuestion(id: string, transaction?: Transaction): Promise<IResponse> {
        const t = transaction ?? await this.questionRepo.transaction();
        try {
            const question = await this.questionRepo.getQuestionById(id, t);
            if (!question) throw new Exception({ code: 404, message: "Question not found" });

            await this.questionRepo.deleteQuestion(id, t);
            if (!transaction) await this.questionRepo.commit(t);
            return { success: true, code: 200, message: "Question deleted successfully" };
        } catch (error) {
            if (!transaction) await this.questionRepo.rollback(t);
            return this.handleError(error);
        }
    }

    private handleError(error: any): IResponse {
        if (error instanceof CustomError) throw new Exception(error);
        if (error instanceof ValidationError) {
            return { code: 400, message: error.errors.map(e => e.message).join(", "), success: false };
        }
        if (error instanceof DatabaseError) {
            return { code: 500, message: "Database error occurred", success: false };
        }
        return { code: 500, message: "An unknown error occurred", success: false };
    }
}