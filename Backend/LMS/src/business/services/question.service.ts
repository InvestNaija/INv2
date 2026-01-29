/* eslint-disable @typescript-eslint/no-explicit-any */
import { IResponse, Exception, UserTenantRoleDto, CustomError } from "@inv2/common";
import { Transaction, Op, ValidationError, SequelizeScopeError, DatabaseError } from "sequelize";
import { Question, Quiz } from "../../domain/sequelize/INv2";
import { CreateQuestionDto, UpdateQuestionDto, GetQuestionDto } from "../../api/dtos";

export class QuestionService {

   // Create a new question
   async createQuestion(currentUser: Partial<UserTenantRoleDto>, data: Partial<CreateQuestionDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await Question.sequelize?.transaction()) as Transaction;
      try {
         // Verify quiz exists
         const quiz = await Quiz.findByPk(data.quizId, { transaction: t });
         if (!quiz) {
            throw new Exception({ code: 404, message: `Quiz not found` });
         }

         const questionData = {
            ...data,
            userId: currentUser?.user?.id,
         };

         const createdQuestion = await Question.create(questionData, { transaction: t, returning: true });
         if (!transaction) await t.commit();

         return { success: true, code: 201, message: `Question created successfully`, data: createdQuestion };
      } catch (error) {
         if (!transaction) await t.rollback();
         return this.handleError(error);
      }
   }

   // Update a question (only creator can update)
   async updateQuestion(id: string, currentUser: Partial<UserTenantRoleDto>, data: Partial<UpdateQuestionDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await Question.sequelize?.transaction()) as Transaction;
      try {
         const question = await Question.findByPk(id, { transaction: t });
         if (!question) {
            throw new Exception({ code: 404, message: `Question not found` });
         }

         // Check ownership - only creator can edit
         if (question.userId !== currentUser?.user?.id) {
            throw new Exception({ code: 403, message: `Only the creator can edit this question` });
         }

         await question.update(data, { transaction: t });
         if (!transaction) await t.commit();
         return { success: true, code: 200, message: `Question updated successfully`, data: question };
      } catch (error) {
         if (!transaction) await t.rollback();
         return this.handleError(error);
      }
   }

   // Delete a question (only creator can delete)
   async deleteQuestion(id: string, currentUser: Partial<UserTenantRoleDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await Question.sequelize?.transaction()) as Transaction;
      try {
         const question = await Question.findByPk(id, { transaction: t });
         if (!question) {
            throw new Exception({ code: 404, message: `Question not found` });
         }

         // Check ownership - only creator can delete
         if (question.userId !== currentUser?.user?.id) {
            throw new Exception({ code: 403, message: `Only the creator can delete this question` });
         }

         await question.destroy({ transaction: t });
         if (!transaction) await t.commit();

         return { success: true, code: 204, message: `Question deleted successfully` };
      } catch (error) {
         if (!transaction) await t.rollback();
         return this.handleError(error);
      }
   }

   // Get questions (all, by quiz, search, or single)
   async getQuestion(query: Partial<GetQuestionDto>): Promise<IResponse> {
      try {
         const { search, id, quizId } = query;
      
         let whereClause: any = {};
         if (id) {
            whereClause = { id };
         } else if (quizId) {
            whereClause = { quizId };
         } else if (search) {
            // Use Op.like for better SQLite compatibility (Op.iLike is PostgreSQL-specific)
            const searchPattern = `%${search}%`;
            whereClause = {
               [Op.or]: [
                  { title: { [Op.like]: searchPattern } },
                  { details: { [Op.like]: searchPattern } }
               ]
            };
         }
      
         const questions = await Question.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
         });

         return { success: true, code: 200, data: questions, message: questions.length ? "Questions found" : "No questions found" };
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
      return { code: 500, message: "An unknown error occurred", success: false };
   }
}
