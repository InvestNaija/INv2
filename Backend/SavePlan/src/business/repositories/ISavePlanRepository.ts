/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { IGenericRepository, IQueryOptions } from "../../../../Common/src/database/IGenericRepository";

export interface ISavePlanRepository extends IGenericRepository {
   update<T>(id: string, attributes?: Partial<T>, options?: Partial<IQueryOptions>, ): Promise<T | null>;
   create<T>(createUserDto: T, options?: Partial<IQueryOptions>): Promise<T | null>;
   findAndCountAll<T>(attributes: string[], where: any, includes?: any[]): Promise<{data: T[], count: number}>;
}
