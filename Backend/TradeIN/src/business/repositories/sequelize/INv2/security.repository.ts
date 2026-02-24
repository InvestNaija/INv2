import { injectable } from "inversify";
import { Transaction } from "sequelize";
import { Repository, Sequelize as SequelizeTS } from "sequelize-typescript";
import { ISecurityRepository } from "../../../../business/repositories/ISecurityRepository";
import { Security } from "../../../../domain/sequelize/INv2/models/security.model";
import { getDbCxn } from "../../../../domain";

@injectable()
export class SecurityRepository implements ISecurityRepository {
    get securityRepo(): Repository<Security> {
        const dbCxn = getDbCxn();
        if (dbCxn) {
            return dbCxn.getRepository(Security);
        }
        if (Security.sequelize) {
            return (Security.sequelize as unknown as SequelizeTS).getRepository(Security);
        }
        throw new Error('Database connection not available');
    }

    public async transaction(): Promise<Transaction> {
        const dbCxn = getDbCxn();
        if (dbCxn) {
            return await dbCxn.transaction();
        }
        return await Security.sequelize!.transaction();
    }

    public async commit(t: Transaction): Promise<void> {
        await t.commit();
    }

    public async rollback(t: Transaction): Promise<void> {
        await t.rollback();
    }

    public async createSecurity(securityData: any, transaction?: Transaction): Promise<any> {
        const security = await this.securityRepo.create(securityData, { transaction });
        return security;
    }

    public async getSecurityById(id: string, transaction?: Transaction, includes?: any[]): Promise<any> {
        const security = await this.securityRepo.findByPk(id, { transaction, include: includes });
        return security;
    }

    public async getSecurityBySymbolAndCustomer(symbol: string, customerId: string, transaction?: Transaction): Promise<any> {
        const security = await this.securityRepo.findOne({
            where: { symbol, customerId },
            transaction
        });
        return security;
    }

    public async getWatchlist(customerId: string, transaction?: Transaction): Promise<any[]> {
        const securities = await this.securityRepo.findAll({
            where: { customerId, watchlist: true },
            transaction
        });
        return securities;
    }

    public async getRecommended(transaction?: Transaction): Promise<any[]> {
        const securities = await this.securityRepo.findAll({
            where: { recommended: true },
            order: [['order', 'ASC']],
            transaction
        });
        return securities;
    }

    public async updateSecurity(id: string, securityData: any, transaction?: Transaction): Promise<any> {
        const security = await this.securityRepo.findByPk(id, { transaction });
        if (security) {
            await security.update(securityData, { transaction });
            return security;
        }
        return null;
    }

    public async deleteSecurity(id: string, transaction?: Transaction): Promise<void> {
        const security = await this.securityRepo.findByPk(id, { transaction });
        if (security) {
            await security.destroy({ transaction });
        }
    }

    public async deleteFromWatchlist(symbol: string, customerId: string, transaction?: Transaction): Promise<void> {
        const security = await this.securityRepo.findOne({
            where: { symbol, customerId, watchlist: true },
            transaction
        });
        if (security) {
            await security.destroy({ transaction });
        }
    }
}
