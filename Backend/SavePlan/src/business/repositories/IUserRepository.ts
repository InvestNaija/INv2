import { CreateUserDto } from "@inv2/common";
import { IGenericRepository, IQueryOptions } from "../../../../Common/src/database/IGenericRepository";

export interface IUserRepository extends IGenericRepository {
   findByEmail<T>(email: string, attributes?: string[], tenantId?: string, options?: IQueryOptions, ): Promise<T | null>;
   // update<T>(id: string, attributes?: Partial<CreateUserDto>, options?: Partial<IQueryOptions>, ): Promise<T | null>;
   create<T>(createUserDto: CreateUserDto, options?: Partial<IQueryOptions>): Promise<T | null>;
}
