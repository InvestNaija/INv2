// import { UserDto } from "@inv2/common";
import { IGenericRepository, IQueryOptions } from "@inv2/common";

export interface ITxnRepository extends IGenericRepository {
   findByReference<T>(reference: string, attributes?: string[], options?: IQueryOptions, ): Promise<T | null>;
   update<T>(id: string, attributes?: Partial<T>, options?: Partial<IQueryOptions>, ): Promise<T | null>;
   create<T>(txnDTO: Partial<T>, options?: IQueryOptions): Promise<T | null>;
}
