import { Transaction } from "sequelize";
import { PasswordHistory } from "../../domain/sequelize/INv2";

export interface IPasswordHistoryRepository {
   create(data: Partial<PasswordHistory>, transaction?: Transaction): Promise<PasswordHistory>;
   findLastN(userId: string, n: number): Promise<PasswordHistory[]>;
}
