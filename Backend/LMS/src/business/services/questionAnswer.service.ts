import { injectable } from "inversify";
import { QuestionAnswer } from "../../domain/sequelize/INv2/models/question-answer.model";
import { Question } from "../../domain/sequelize/INv2/models/question.model";
import { CreateQuestionAnswerDto, UpdateQuestionAnswerDto, GetQuestionAnswerDto } from "../../api/dtos";
import { IResponse, UserTenantRoleDto } from "@inv2/common";
import { Transaction } from "sequelize";

@injectable()
export class QuestionAnswerService {
    async createQuestionAnswer(currentUser: Partial<UserTenantRoleDto>, data: Partial<CreateQuestionAnswerDto>, transaction?: Transaction): Promise<IResponse> {
        try {
            const allowedRoles = ["PROVIDER", "SUPER_ADMIN", "TENANT_ADMIN"];
            const hasRole = currentUser.Tenant?.some(tenant => tenant.Roles?.some(role => role.name && allowedRoles.includes(role.name)));
            if (!hasRole) {
                return { code: 403, success: false, message: "Only PROVIDER or SUPER_ADMIN can add a question answer" };
            }

            const question = await Question.findByPk(data.questionId);
            if (!question) {
                return { code: 404, success: false, message: 'Question not found' };
            }

            const qaData = {
                ...data
            };

            const createdQA = await QuestionAnswer.create(qaData, { transaction, returning: true });

            return {
                code: 201,
                success: true,
                message: "Question Answer created successfully",
                data: createdQA,
            };
        } catch (error) {
            return { code: 500, success: false, message: (error as Error).message };
        }
    }

    async getQuestionAnswers(query: Partial<GetQuestionAnswerDto>): Promise<IResponse> {
        try {
            const whereClause: any = {};
            if (query.id) whereClause.id = query.id;
            if (query.questionId) whereClause.questionId = query.questionId;

            const answers = await QuestionAnswer.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                include: [
                    { model: Question, as: 'questions' }
                ]
            });

            return {
                code: 200,
                success: true,
                message: "Question Answers retrieved successfully",
                data: answers
            };
        } catch (error) {
            return { code: 500, success: false, message: (error as Error).message };
        }
    }

    async updateQuestionAnswer(id: string, currentUser: Partial<UserTenantRoleDto>, data: Partial<UpdateQuestionAnswerDto>, transaction?: Transaction): Promise<IResponse> {
        try {
            const allowedRoles = ["PROVIDER", "SUPER_ADMIN", "TENANT_ADMIN"];
            const hasRole = currentUser.Tenant?.some(tenant => tenant.Roles?.some(role => role.name && allowedRoles.includes(role.name)));
            if (!hasRole) {
                return { code: 403, success: false, message: "Only PROVIDER or SUPER_ADMIN can update a question answer" };
            }

            const questionAnswer = await QuestionAnswer.findByPk(id);
            if (!questionAnswer) {
                return { code: 404, success: false, message: 'Question Answer not found' };
            }

            await questionAnswer.update(data, { transaction });

            return {
                code: 200,
                success: true,
                message: "Question Answer updated successfully",
                data: questionAnswer
            };
        } catch (error) {
            return { code: 500, success: false, message: (error as Error).message };
        }
    }

    async deleteQuestionAnswer(id: string, currentUser: Partial<UserTenantRoleDto>, transaction?: Transaction): Promise<IResponse> {
        try {
            const allowedRoles = ["PROVIDER", "SUPER_ADMIN", "TENANT_ADMIN"];
            const hasRole = currentUser.Tenant?.some(tenant => tenant.Roles?.some(role => role.name && allowedRoles.includes(role.name)));
            if (!hasRole) {
                return { code: 403, success: false, message: "Only PROVIDER or SUPER_ADMIN can delete a question answer" };
            }

            const questionAnswer = await QuestionAnswer.findByPk(id);
            if (!questionAnswer) {
                return { code: 404, success: false, message: 'Question Answer not found' };
            }

            await questionAnswer.destroy({ transaction });

            return {
                code: 204,
                success: true,
                message: "Question Answer deleted successfully",
                data: null
            };
        } catch (error) {
            return { code: 500, success: false, message: (error as Error).message };
        }
    }
}
