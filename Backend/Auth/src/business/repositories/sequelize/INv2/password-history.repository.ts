import { injectable } from "inversify";
import { Transaction } from "sequelize";
import { PasswordHistory } from "../../../../domain/sequelize/INv2";
import { IPasswordHistoryRepository } from "../../IPasswordHistoryRepository";
import { getDbCxn } from "../../../../domain";

@injectable()
export class PasswordHistoryRepository implements IPasswordHistoryRepository {
   get repo() {
      return getDbCxn()?.getRepository(PasswordHistory);
   }

   public async create(data: Partial<PasswordHistory>, transaction?: Transaction): Promise<PasswordHistory> {
      return await this.repo.create(data, { transaction });
   }

   public async findLastN(userId: string, n: number): Promise<PasswordHistory[]> {
      return await this.repo.findAll({
         where: { userId },
         order: [['createdAt', 'DESC']],
         limit: n,
      });
   }
}
