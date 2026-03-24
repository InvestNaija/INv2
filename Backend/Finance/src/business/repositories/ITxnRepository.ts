// import { UserDto } from "@inv2/common";
import { IGenericRepository, IQueryOptions, UserDto } from "@inv2/common";

export interface ITxnRepository extends IGenericRepository {
   findByReference<T>(reference: string, attributes?: string[], options?: IQueryOptions, ): Promise<T | null>;
   update<T>(id: string, attributes?: Partial<T>, options?: Partial<IQueryOptions>, ): Promise<T | null>;
   create<T>(txnDTO: Partial<T>, options?: IQueryOptions): Promise<T | null>;
}

export interface IUserRepository extends IGenericRepository {
   findByEmail<T>(email: string, attributes: string[], tenantId?: string, options?: IQueryOptions): Promise<T>;
   findOne<T>(attributes: string[], where: any, includes?: any[]): Promise<T | null>;
   update<T>(id: string, attributes?: Partial<UserDto>, options?: Partial<IQueryOptions>): Promise<T | null>;
}
