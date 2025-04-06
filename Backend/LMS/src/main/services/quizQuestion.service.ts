/* eslint-disable @typescript-eslint/no-explicit-any */
import { IResponse, Exception, UserTenantRoleDto, CustomError } from "@inv2/common";
import { Transaction, Op, ValidationError, SequelizeScopeError, DatabaseError } from "sequelize";
import { QuizQuestion } from "../../database/sequelize/INv2";
import { QuizDto, GetQuizDto} from "../dtos";

export class QuizQuestionService {
   async createQuizQuestion(currentUser: UserTenantRoleDto , data: Partial<QuizDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await QuizQuestion.sequelize?.transaction()) as Transaction;
      try {
         const createdEntry = await QuizQuestion.create(data, { transaction: t, returning: true });
         if (!transaction) await t.commit();

         return { success: true, code: 201, message: `Record created successfully`, data: createdEntry };
      } catch (error) {
         if (!transaction) await t.rollback();
         return this.handleError(error);
      }
   }

   // Update an entry
   async updateQuizQuestion(id: string, data: Partial<QuizDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await QuizQuestion.sequelize?.transaction()) as Transaction;
      try {
         const entry = await QuizQuestion.findByPk(id);
         if (!entry) throw new Exception({ code: 404, message: `Record not found` });

         await entry.update(data, { transaction: t });
         if (!transaction) await t.commit();
         return { success: true, code: 200, message: `Record updated successfully`, data: entry };
      } catch (error) {
         if (!transaction) await t.rollback();
         return this.handleError(error);
      }
   }

   // Delete an entry (soft delete)
   async deleteQuizQuestion(id: string, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await QuizQuestion.sequelize?.transaction()) as Transaction;
      try {
         const entry = await QuizQuestion.findByPk(id);
         if (!entry) throw new Exception({ code: 404, message: `Record not found` });

         await entry.destroy({ transaction: t });
         if (!transaction) await t.commit();

         return { success: true, code: 200, message: `Record deleted successfully` };
      } catch (error) {
         if (!transaction) await t.rollback();
         return this.handleError(error);
      }
   }

   // Get entries (all, search, or single)
   async getQuizQuestion(query: Partial<GetQuizDto>): Promise<IResponse> {
      try {
         const { search, id } = query;
      
         let whereClause = {};
         if (id) {
            whereClause = { id };
         } else if (search) {
            whereClause = {
               [Op.or]: [
                  { title: { [Op.iLike]: `%${search}%` } },
                  { summary: { [Op.iLike]: `%${search}%` } }
               ]
            };
         }
      
         const entries = await QuizQuestion.findAll({
            where: whereClause
         });

         return { success: true, code: 200, data: entries, message: entries.length ? "Records found" : "No records found" };
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