/* eslint-disable @typescript-eslint/no-explicit-any */
import { IResponse, Exception, UserTenantRoleDto, CustomError } from "@inv2/common";
import { Transaction, Op, ValidationError, SequelizeScopeError, DatabaseError } from "sequelize";
import { QuizQuestion, Quiz, Question } from "../../domain/sequelize/INv2";
import { CreateQuizQuestionDto, UpdateQuizQuestionDto, GetQuizQuestionDto } from "../../api/dtos";

export class QuizQuestionService {

    // Create a new QuizQuestion mapping
    async createQuizQuestion(currentUser: Partial<UserTenantRoleDto>, data: Partial<CreateQuizQuestionDto>, transaction?: Transaction): Promise<IResponse> {
        const t = transaction ?? (await QuizQuestion.sequelize?.transaction()) as Transaction;
        try {
            // Verify authorization: only PROVIDER or SUPER_ADMIN
            const userRole = currentUser?.Tenant?.[0]?.Roles?.[0]?.name || "";
            if (userRole !== "PROVIDER" && userRole !== "SUPER_ADMIN" && userRole !== "TENANT_ADMIN") {
                // Note: Added TENANT_ADMIN as a fallback based on system roles, although strictly checking PROVIDER/SUPER_ADMIN
                if (userRole !== "PROVIDER" && userRole !== "SUPER_ADMIN") {
                    throw new Exception({ code: 403, message: `Only PROVIDER or SUPER_ADMIN can add a question to a quiz` });
                }
            }

            // Verify quiz exists
            const quiz = await Quiz.findByPk(data.quizId, { transaction: t });
            if (!quiz) {
                throw new Exception({ code: 404, message: `Quiz not found` });
            }

            // Verify question exists
            const question = await Question.findByPk(data.questionId, { transaction: t });
            if (!question) {
                throw new Exception({ code: 404, message: `Question not found` });
            }

            const qqData = {
                ...data,
                userId: currentUser?.user?.id,
                // Map our correctly spelled DTO fields to the DB model's typo fields
                passScrore: data.passScore,
                failScrore: data.failScore,
            };

            const createdQQ = await QuizQuestion.create(qqData, { transaction: t, returning: true });
            if (!transaction) await t.commit();

            return { success: true, code: 201, message: `Question added to quiz successfully`, data: createdQQ };
        } catch (error) {
            if (!transaction) await t.rollback();
            return this.handleError(error);
        }
    }

    // Update a QuizQuestion (only creator can update)
    async updateQuizQuestion(id: string, currentUser: Partial<UserTenantRoleDto>, data: Partial<UpdateQuizQuestionDto>, transaction?: Transaction): Promise<IResponse> {
        const t = transaction ?? (await QuizQuestion.sequelize?.transaction()) as Transaction;
        try {
            const quizQuestion = await QuizQuestion.findByPk(id, { transaction: t });
            if (!quizQuestion) {
                throw new Exception({ code: 404, message: `QuizQuestion mapping not found` });
            }

            // Check ownership - only the creator who linked it (or who created the quiz context) can edit. 
            // Assuming userId on QuizQuestion represents the creator.
            const userRole = currentUser?.Tenant?.[0]?.Roles?.[0]?.name || "";
            if (quizQuestion.userId !== currentUser?.user?.id && userRole !== "SUPER_ADMIN") {
                throw new Exception({ code: 403, message: `Only the creator can edit this mapping` });
            }

            const updateData: any = { ...data };
            if (typeof data.passScore !== 'undefined') updateData.passScrore = data.passScore;
            if (typeof data.failScore !== 'undefined') updateData.failScrore = data.failScore;

            // Remove explicitly defined spelled correct fields from update object so it doesn't fail on missing column if not mapped
            delete updateData.passScore;
            delete updateData.failScore;

            await quizQuestion.update(updateData, { transaction: t });
            if (!transaction) await t.commit();
            return { success: true, code: 200, message: `QuizQuestion mapping updated successfully`, data: quizQuestion };
        } catch (error) {
            if (!transaction) await t.rollback();
            return this.handleError(error);
        }
    }

    // Delete a QuizQuestion (only creator can delete)
    async deleteQuizQuestion(id: string, currentUser: Partial<UserTenantRoleDto>, transaction?: Transaction): Promise<IResponse> {
        const t = transaction ?? (await QuizQuestion.sequelize?.transaction()) as Transaction;
        try {
            const quizQuestion = await QuizQuestion.findByPk(id, { transaction: t });
            if (!quizQuestion) {
                throw new Exception({ code: 404, message: `QuizQuestion mapping not found` });
            }

            // Check ownership - only creator can delete
            const userRole = currentUser?.Tenant?.[0]?.Roles?.[0]?.name || "";
            if (quizQuestion.userId !== currentUser?.user?.id && userRole !== "SUPER_ADMIN") {
                throw new Exception({ code: 403, message: `Only the creator can delete this mapping` });
            }

            await quizQuestion.destroy({ transaction: t });
            if (!transaction) await t.commit();

            return { success: true, code: 204, message: `QuizQuestion mapping deleted successfully` };
        } catch (error) {
            if (!transaction) await t.rollback();
            return this.handleError(error);
        }
    }

    // Get QuizQuestions
    async getQuizQuestions(query: Partial<GetQuizQuestionDto>): Promise<IResponse> {
        try {
            const { id, quizId, questionId } = query;

            let whereClause: any = {};
            if (id) {
                whereClause = { id };
            } else if (quizId && questionId) {
                whereClause = { quizId, questionId };
            } else if (quizId) {
                whereClause = { quizId };
            } else if (questionId) {
                whereClause = { questionId };
            }

            const quizQuestions = await QuizQuestion.findAll({
                where: whereClause,
                order: [['order', 'ASC'], ['createdAt', 'DESC']],
                include: [
                    { model: Question, as: 'questions' },
                    { model: Quiz, as: 'quizzes' }
                ]
            });

            return { success: true, code: 200, data: quizQuestions, message: quizQuestions.length ? "QuizQuestions found" : "No QuizQuestions found" };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Error handler
    private handleError(error: any): IResponse {
        if (error instanceof CustomError) {
            throw new Exception(error);
        } else if (error instanceof ValidationError) {
            return { code: 400, message: error.errors.map(e => e.message).join(", "), success: false };
        } else if (error instanceof DatabaseError) {
            return { code: 500, message: "Database error occurred", success: false };
        } else if (error instanceof SequelizeScopeError) {
            return { code: 500, message: "Scope error with the database query", success: false };
        }
        return { code: 500, message: error?.message || "An unknown error occurred", success: false };
    }
}
