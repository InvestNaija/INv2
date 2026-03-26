import { injectable } from 'inversify';
import { Holiday } from '../models/holiday.model';
import { getDbCxn } from '../../index';
import { Repository } from 'sequelize-typescript';

/**
 * Holiday Repository Interface
 * Defines the contract for holiday data access operations.
 */
export interface IHolidayRepository {
   /** Creates a new holiday record */
   create(holiday: Partial<Holiday>): Promise<Holiday>;
   /** Finds a holiday by its internal ID */
   findById(id: string): Promise<Holiday | null>;
   /** Retrieves all holiday records */
   findAll(): Promise<Holiday[]>;
   /** Updates an existing holiday record */
   update(id: string, holiday: Partial<Holiday>): Promise<[number, Holiday[]]>;
   /** Deletes a holiday record by ID */
   delete(id: string): Promise<number>;
}

/**
 * Holiday Repository Implementation
 * Handles database interactions for the Holiday entity using Sequelize.
 */
@injectable()
export class HolidayRepository implements IHolidayRepository {
   /** Retrieves the Sequelize repository for the Holiday model */
   private get repo(): Repository<Holiday> {
      return getDbCxn()?.getRepository(Holiday);
   }

   async create(holiday: Partial<Holiday>): Promise<Holiday> {
      return this.repo.create(holiday as any);
   }

   async findById(id: string): Promise<Holiday | null> {
      return this.repo.findByPk(id);
   }

   async findAll(): Promise<Holiday[]> {
      return this.repo.findAll({ order: [['startDate', 'ASC']] });
   }

   async update(id: string, holiday: Partial<Holiday>): Promise<[number, Holiday[]]> {
      const [count, rows] = await this.repo.update(holiday, { where: { id }, returning: true });
      return [count, rows as Holiday[]];
   }

   async delete(id: string): Promise<number> {
      return this.repo.destroy({ where: { id } });
   }
}
