import { inject, injectable } from "inversify";
import { IResponse, Exception, UserTenantRoleDto, CustomError } from "@inv2/common";
import {Transaction, ValidationError, DatabaseError} from "sequelize";
import { QuizDto } from "../../api/dtos";
import { TYPES } from "../types";
import { IQuizRepository } from "../repositories";

@injectable()
export class QuizService {
    constructor(
        @inject(TYPES.IQuizRepository) 
        private readonly quizRepo: IQuizRepository
    ) {}

    async createQuiz(currentUser: Partial<UserTenantRoleDto>, data: Partial<QuizDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? await this.quizRepo.transaction();
      try {
         data.userId = currentUser?.user?.id;
         const createdQuiz = await this.quizRepo.createQuiz(data, t);

         if (!transaction) await this.quizRepo.commit(t);
         return { success: true, code: 201, message: "Quiz created successfully", data: createdQuiz };
      } catch (error) {
         if (!transaction) await this.quizRepo.rollback(t);
         return this.handleError(error);
      }
   }

   async updateQuiz(id: string, data: Partial<QuizDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? await this.quizRepo.transaction();
      try {
         const quiz = await this.quizRepo.getQuizById(id, t);
         if (!quiz) throw new Exception({ code: 404, message: "Quiz not found" });

         await this.quizRepo.updateQuiz(id, data, t);
         const updatedQuiz = await this.quizRepo.getQuizById(id, t);
         if (!transaction) await this.quizRepo.commit(t);
         return { success: true, code: 200, message: "Quiz updated successfully", data: updatedQuiz };
      } catch (error) {
         if (!transaction) await this.quizRepo.rollback(t);
         return this.handleError(error);
      }
   }

   async getQuizById(id: string, transaction?: Transaction): Promise<IResponse> {
      try {
         const quiz = await this.quizRepo.getQuizById(id, transaction);
         if (!quiz) throw new Exception({ code: 404, message: "Quiz not found" });

         return { success: true, code: 200, message: "Quiz retrieved successfully", data: quiz };
      } catch (error) {
         return this.handleError(error);
      }
   }

    async getQuizzes(filter: any, transaction?: Transaction): Promise<IResponse> {
      try {
         const quizzes = await this.quizRepo.getQuizzes(filter, transaction);
         return { success: true, code: 200, message: "Quizzes retrieved successfully", data: quizzes };
      } catch (error) {
         return this.handleError(error);
      }
   }

   async deleteQuiz(id: string, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? await this.quizRepo.transaction();
      try {
         const quiz = await this.quizRepo.getQuizById(id, t);
         if (!quiz) throw new Exception({ code: 404, message: "Quiz not found" });

         await this.quizRepo.deleteQuiz(id, t);
         if (!transaction) await this.quizRepo.commit(t);
         return { success: true, code: 200, message: "Quiz deleted successfully" };
      } catch (error) {
         if (!transaction) await this.quizRepo.rollback(t);
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