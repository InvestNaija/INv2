/* eslint-disable @typescript-eslint/no-explicit-any */
import { IResponse, Exception, UserTenantRoleDto, CustomError } from "@inv2/common";
import { Transaction, Op, ValidationError, SequelizeScopeError, DatabaseError } from "sequelize";
import { LMS, UserLMS, QuizAttemptAnswer, QuizAttempt, Question } from "../../database/sequelize/INv2";
import {LmsDto, GetLmsDto, AttemptAnswerDto, GetAttemptAnswerDto} from "../dtos";

export class AttemptAnswerService {

   // Create a new entry
   async attemptAnswer(currentUser: UserTenantRoleDto ,data: Partial<AttemptAnswerDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await QuizAttemptAnswer.sequelize?.transaction()) as Transaction;
      try {
         //find the quizAttempt
         const findQuizAttempt = await QuizAttempt.findOne({
            where: {
               id: data.quizAttepmtId,
               userId: currentUser.user.id
            }
         })
         if(!findQuizAttempt) throw new Exception({ code: 404, message: `Record not found` });
         console.log(JSON.stringify(findQuizAttempt), 'quizAttempt here')
         /**
          * Calculate the answer Score before storing it
          */
         const createdEntry = await QuizAttemptAnswer.create(data, { transaction: t, returning: true });
         if (!transaction) await t.commit();
         return { success: true, code: 201, message: `Record created successfully`, data: createdEntry };
      } catch (error) {
         if (!transaction) await t.rollback();
         return this.handleError(error);
      }
   }

   // Update an entry
   async updateAttemptAnswer(id: string, data: Partial<AttemptAnswerDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await QuizAttemptAnswer.sequelize?.transaction()) as Transaction;
      try {
         const findQuizAttemptAnwer = await QuizAttemptAnswer.findByPk(id);
         if (!findQuizAttemptAnwer) throw new Exception({ code: 404, message: `Record not found` });

         await findQuizAttemptAnwer.update(data, { transaction: t });
         if (!transaction) await t.commit();
         return { success: true, code: 200, message: `Record updated successfully`, data: findQuizAttemptAnwer };
      } catch (error) {
         if (!transaction) await t.rollback();
         return this.handleError(error);
      }
   }

   // Delete an entry (soft delete)
   async deleteAttemptAnswer(id: string, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await QuizAttemptAnswer.sequelize?.transaction()) as Transaction;
      try {
         const entry = await QuizAttemptAnswer.findByPk(id);
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
   async getAttemptAnswer(query: Partial<GetAttemptAnswerDto>): Promise<IResponse> {
      try {
         const { search, id, attemptId, question } = query;
   
         // Use LIKE for test environment, ILIKE for others
         const likeOperator = process.env.NODE_ENV === 'test' ? Op.like : Op.iLike;
   
         let quizAttemptWhereClause = {}, whereClause = {}, questionClause = {};
         if (id) {
            whereClause = { id };
         } else if (search) {
            whereClause = {
               [Op.or]: [
                  { answerGiven: { [likeOperator]: `%${search}%` } },
               ]
            };
            questionClause = {
               [Op.or]: [
                  { title: { [likeOperator]: `%${search}%` } },
                  { details: { [likeOperator]: `%${search}%` } }
               ]
            };
         }
   
         if (attemptId) {
            quizAttemptWhereClause = { 
               id: attemptId
            };
         }
         if (question) {
            questionClause = {
               id: question
            };
         }
   
         const entries = await QuizAttemptAnswer.findAll({
            where: whereClause,
            include: [
               {
                  model: QuizAttempt,
                  where: quizAttemptWhereClause
               },
               {
                  model: Question,
                  where: questionClause
               }
            ]
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