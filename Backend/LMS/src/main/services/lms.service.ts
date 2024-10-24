/* eslint-disable @typescript-eslint/no-explicit-any */
import { IResponse, Exception, CustomError } from "@inv2/common";
import { Transaction, Op, ValidationError, SequelizeScopeError, DatabaseError } from "sequelize";
import { LMS } from "../../../database/sequelize/INv2";
import {LmsDto, QueryDto} from "../dtos";

export class LmsService {

   // Create a new entry
   async createLms(data: Partial<LmsDto>, transaction?: Transaction): Promise<IResponse> {
      const t = transaction ?? (await LMS.sequelize?.transaction()) as Transaction;
      try {
         const existingRecord = await LMS.findOne({
            where: { title: { [Op.iLike]: data.title } }
         });
      
         if (existingRecord) {
            throw new Exception({ code: 400, message: `Record with this title already exists` });
         }

         const createdEntry = await LMS.create(data, { transaction: t, returning: true });
         if (!transaction) await t.commit();

         return { success: true, code: 201, message: `Record created successfully`, data: createdEntry };
      } catch (error) {
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
   async getLms(query: Partial<QueryDto>): Promise<IResponse> {
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
      const err = error as Error;
  
      if (error instanceof CustomError) {
         throw new Exception(error);  // Custom errors can be thrown
      } else if (error instanceof (ValidationError || SequelizeScopeError || DatabaseError)) {
         return { code: 500, message: error.errors[0].message, success: false };
      } else {
         return { code: 500, message: err.message, success: false };
      }
   }
  
}