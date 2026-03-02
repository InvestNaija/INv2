import { injectable } from "inversify";
import { QuizAttempt } from "../../domain/sequelize/INv2/models/quiz-attempt.model";
import { Quiz } from "../../domain/sequelize/INv2/models/quiz.model";
import { CreateQuizAttemptDto, UpdateQuizAttemptDto, GetQuizAttemptDto } from "../../api/dtos";
import { IResponse, UserTenantRoleDto } from "@inv2/common";
import { Transaction } from "sequelize";

@injectable()
export class QuizAttemptService {
    async createQuizAttempt(currentUser: Partial<UserTenantRoleDto>, data: Partial<CreateQuizAttemptDto>, transaction?: Transaction): Promise<IResponse> {
        try {
            // A quiz attempt can be taken by any role, no restrictions

            const quiz = await Quiz.findByPk(data.quizId);
            if (!quiz) {
                return { code: 404, success: false, message: 'Quiz not found' };
            }

            const attemptData = {
                quizId: data.quizId,
                userId: currentUser.user?.id,
                attemptIp: data.attemptIp,
                attemptStart: new Date()
            };

            const createdQA = await QuizAttempt.create(attemptData, { transaction, returning: true });

            return {
                code: 201,
                success: true,
                message: "Quiz Attempt started successfully",
                data: createdQA,
            };
        } catch (error) {
            return { code: 500, success: false, message: (error as Error).message };
        }
    }

    async getQuizAttempts(query: Partial<GetQuizAttemptDto>): Promise<IResponse> {
        try {
            const whereClause: any = {};
            if (query.id) whereClause.id = query.id;
            if (query.quizId) whereClause.quizId = query.quizId;
            if (query.userId) whereClause.userId = query.userId;

            const attempts = await QuizAttempt.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                include: [
                    { model: Quiz, as: 'quizzes' }
                ]
            });

            return {
                code: 200,
                success: true,
                message: "Quiz Attempts retrieved successfully",
                data: attempts
            };
        } catch (error) {
            return { code: 500, success: false, message: (error as Error).message };
        }
    }

    async updateQuizAttempt(id: string, currentUser: Partial<UserTenantRoleDto>, data: Partial<UpdateQuizAttemptDto>, transaction?: Transaction): Promise<IResponse> {
        try {
            const quizAttempt = await QuizAttempt.findByPk(id);
            if (!quizAttempt) {
                return { code: 404, success: false, message: 'Quiz Attempt not found' };
            }

            // Only the owner can end/update their attempt, or PROVIDER
            if (quizAttempt.userId !== currentUser.user?.id) {
                const allowedRoles = ["PROVIDER", "SUPER_ADMIN", "TENANT_ADMIN"];
                const hasRole = currentUser.Tenant?.some(tenant => tenant.Roles?.some(role => role.name && allowedRoles.includes(role.name)));
                if (!hasRole) {
                    return { code: 403, success: false, message: "You don't have permission to update this Quiz Attempt" };
                }
            }

            await quizAttempt.update(data, { transaction });

            return {
                code: 200,
                success: true,
                message: "Quiz Attempt updated successfully",
                data: quizAttempt
            };
        } catch (error) {
            return { code: 500, success: false, message: (error as Error).message };
        }
    }

    async deleteQuizAttempt(id: string, currentUser: Partial<UserTenantRoleDto>, transaction?: Transaction): Promise<IResponse> {
        try {
            const allowedRoles = ["PROVIDER", "SUPER_ADMIN", "TENANT_ADMIN"];
            const hasRole = currentUser.Tenant?.some(tenant => tenant.Roles?.some(role => role.name && allowedRoles.includes(role.name)));

            const quizAttempt = await QuizAttempt.findByPk(id);
            if (!quizAttempt) {
                return { code: 404, success: false, message: 'Quiz Attempt not found' };
            }

            if (quizAttempt.userId !== currentUser.user?.id && !hasRole) {
                return { code: 403, success: false, message: "Only PROVIDER or SUPER_ADMIN or the Owner can delete a quiz attempt" };
            }

            await quizAttempt.destroy({ transaction });

            return {
                code: 204,
                success: true,
                message: "Quiz Attempt deleted successfully",
                data: null
            };
        } catch (error) {
            return { code: 500, success: false, message: (error as Error).message };
        }
    }
}
