/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IQueryOptions {
   transaction: any;
}
export interface IGenericRepository {
   transaction(): any;
   commit(t: any): Promise<void>;
   rollback(t: any): Promise<void>;
   // create<T>(createUserDto: CreateUserDto): Promise<T>;
   findOne<T>(attributes: string[], where: any, includes?: any[]): Promise<T | null>;
}
