/* eslint-disable @typescript-eslint/no-explicit-any */
import { IResponse, Exception, UserTenantRoleDto, CustomError, moment } from "@inv2/common";
import { Transaction, Op, ValidationError, SequelizeScopeError, DatabaseError } from "sequelize";
import { LMS, Question, Quiz, QuizAttempt, QuizAttemptAnswer } from "../../database/sequelize/INv2";
import { QuizAttemptDto } from "../dtos";

export class QuizAttemptService {
   // Create a new entry
   async startAttempt(currentUser: UserTenantRoleDto, data: Partial<QuizAttemptDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await QuizAttempt.sequelize?.transaction()) as Transaction;
      try {
         let createdEntry: QuizAttempt | null = null;
         const findQuiz = await Quiz.findByPk(data.quiz);
         if(!findQuiz) return { success: false, code: 404, message: `Quiz does not exist`, data: createdEntry };
         if (currentUser && currentUser.user.id) {
            createdEntry = await QuizAttempt.create({ quizId: data.quiz, userId: currentUser.user.id }, { transaction: t, returning: true });
         }
         if (!transaction) await t.commit();
         return { success: true, code: 201, message: `Quiz started`, data: createdEntry };
      } catch (error) {
         if (!transaction) await t.rollback();
         return this.handleError(error);
      }
   }
   //submit quizAttempt
   async endAttempt(currentUser: UserTenantRoleDto, data: Partial<QuizAttemptDto>, transaction?: Transaction): Promise<IResponse>{
      const t = transaction ?? (await QuizAttempt.sequelize?.transaction()) as Transaction;
      try{
         const quizAttempt: QuizAttempt | null = await QuizAttempt.findOne({
            where: { quizId: data.id, userId: currentUser.user.id }
         });
         if(!quizAttempt){
            return { success: false, code: 404, message: `Quiz attempt does not exist.` };
         };
         await quizAttempt.update({
            attemptEnd: moment()
         });
         return { success: true, code: 200, message: `Quiz submitted successfully` };
      }catch (error) {
         if (!transaction) await t.rollback();
         return this.handleError(error);
      }
   }
   //get all quizAttempts
   async getAttempts(currentUser: UserTenantRoleDto, data: Partial<QuizAttemptDto>): Promise<IResponse>{
      try{
         const whereClause = {
            ...(  data.quiz && { quizId: data.quiz } ),
            userId: currentUser.user.id,
         };
         const quizAttempt: Array<QuizAttempt> | null = await QuizAttempt.findAll({
            where: whereClause,
            include: [
               {
                  model: Quiz,
                  attributes: ['title'],
                  include: [
                     {
                        model: LMS,
                        attributes: ['title', 'summary', 'content']
                     }
                  ]
               },
               {
                  model: QuizAttemptAnswer,
                  attributes: ['answerGiven', 'answerScore'],
                  include: [
                     {
                        model: Question,
                        attributes: ['id', 'title', 'details']
                     }
                  ]
               }
            ]
         });
         return { success: true, code: 200, message: `Quiz submitted successfully`, data: quizAttempt };
      }catch (error) {
         return this.handleError(error);
      }
   }

   async deleteAttempt(currentUser: UserTenantRoleDto, data: Partial<QuizAttemptDto>): Promise<IResponse>{
      try{
         const findQuizAttempt = await QuizAttempt.findOne({
            where: {
               userId: currentUser.user.id,
               id: data.id
            }
         });
         if(!findQuizAttempt) return { success: false, code: 404, message: `Quiz attempt does not exist.` }; 
         await findQuizAttempt.destroy();
         return { success: true, code: 200, message: `Quiz attempt deleted.` };
      }catch(error){
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