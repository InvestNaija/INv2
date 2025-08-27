/* eslint-disable @typescript-eslint/no-explicit-any */
import { IResponse, Exception, UserTenantRoleDto, CustomError } from "@inv2/common";
import { Transaction, Op, ValidationError, SequelizeScopeError, DatabaseError } from "sequelize";
import { LMS } from "../../domain/sequelize/INv2";
import {LmsDto, GetLmsDto} from "../../api/dtos";

export class LmsService {

   // Create a new entry
   async createLms(currentUser: Partial<UserTenantRoleDto> ,data: Partial<LmsDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await LMS.sequelize?.transaction()) as Transaction;
      try {

         const createdEntry = await LMS.create(data, { transaction: t, returning: true });
         // Add associated users using the add method if userIds are provided
         if (currentUser?.user?.id && createdEntry.id) {
            await (createdEntry as any).addUsers([currentUser.user.id], { transaction: t });
         }
         if (!transaction) await t.commit();

         return { success: true, code: 200, message: `Record created successfully`, data: createdEntry };
      } catch (error) {
         console.log(error);
         if (!transaction) await t.rollback();
         return this.handleError(error);
      }
   }

   // Update an entry
   async updateLms(id: string, data: Partial<LmsDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await LMS.sequelize?.transaction()) as Transaction;
      try {
         const entry = await LMS.findByPk(id);
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
   async deleteLms(id: string, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await LMS.sequelize?.transaction()) as Transaction;
      try {
         const entry = await LMS.findByPk(id);
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
   async getLms(query: Partial<GetLmsDto>): Promise<IResponse> {
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
      
         const entries = await LMS.findAll({
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