import { injectable } from "inversify";
import { QuizAttemptAnswer } from "../../domain/sequelize/INv2/models/quiz-attempt-answer.model";
import { CreateAttemptAnswerDto, UpdateAttemptAnswerDto, GetAttemptAnswerDto } from "../../api/dtos";
import { IResponse, UserTenantRoleDto } from "@inv2/common";
import { Transaction } from "sequelize";

@injectable()
export class AttemptAnswerService {
    async createAttemptAnswer(currentUser: Partial<UserTenantRoleDto>, data: Partial<CreateAttemptAnswerDto>, transaction?: Transaction): Promise<IResponse> {
        try {
            // A quiz attempt is taken by a role, answer additions are unresticted per attempt owner in practice

            const attemptData = {
                quizAttemptId: data.quizAttemptId,
                questionId: data.questionId,
                answerGiven: data.answerGiven,
                answerScore: data.answerScore
            };

            const createdAnswer = await QuizAttemptAnswer.create(attemptData, { transaction, returning: true });

            return {
                code: 201,
                success: true,
                message: "Attempt Answer submitted successfully",
                data: createdAnswer,
            };
        } catch (error) {
            return { code: 500, success: false, message: (error as Error).message };
        }
    }

    async getAttemptAnswers(query: Partial<GetAttemptAnswerDto>): Promise<IResponse> {
        try {
            const whereClause: any = {};
            if (query.id) whereClause.id = query.id;
            if (query.quizAttemptId) whereClause.quizAttemptId = query.quizAttemptId;
            if (query.questionId) whereClause.questionId = query.questionId;

            const answers = await QuizAttemptAnswer.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']]
            });

            return {
                code: 200,
                success: true,
                message: "Attempt Answers retrieved successfully",
                data: answers
            };
        } catch (error) {
            return { code: 500, success: false, message: (error as Error).message };
        }
    }

    async updateAttemptAnswer(id: string, currentUser: Partial<UserTenantRoleDto>, data: Partial<UpdateAttemptAnswerDto>, transaction?: Transaction): Promise<IResponse> {
        try {
            const attemptAnswer = await QuizAttemptAnswer.findByPk(id);
            if (!attemptAnswer) {
                return { code: 404, success: false, message: 'Attempt Answer not found' };
            }

            await attemptAnswer.update(data, { transaction });

            return {
                code: 200,
                success: true,
                message: "Attempt Answer updated successfully",
                data: attemptAnswer
            };
        } catch (error) {
            return { code: 500, success: false, message: (error as Error).message };
        }
    }

    async deleteAttemptAnswer(id: string, currentUser: Partial<UserTenantRoleDto>, transaction?: Transaction): Promise<IResponse> {
        try {
            const allowedRoles = ["PROVIDER", "SUPER_ADMIN", "TENANT_ADMIN"];
            const hasRole = currentUser.Tenant?.some(tenant => tenant.Roles?.some(role => role.name && allowedRoles.includes(role.name)));

            const attemptAnswer = await QuizAttemptAnswer.findByPk(id);
            if (!attemptAnswer) {
                return { code: 404, success: false, message: 'Attempt Answer not found' };
            }

            // Could restrict to attempt owner mapping eventually but enforcing global deletion constraints for now
            if (!hasRole) {
                return { code: 403, success: false, message: "Only PROVIDER or SUPER_ADMIN can delete an attempt answer directly" };
            }

            await attemptAnswer.destroy({ transaction });

            return {
                code: 204,
                success: true,
                message: "Attempt Answer deleted successfully",
                data: null
            };
        } catch (error) {
            return { code: 500, success: false, message: (error as Error).message };
        }
    }
}
