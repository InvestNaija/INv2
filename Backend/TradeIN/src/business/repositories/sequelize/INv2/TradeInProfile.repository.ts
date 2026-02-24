import { injectable } from "inversify";
import { Transaction } from "sequelize";
import { Repository, Sequelize as SequelizeTS } from "sequelize-typescript";
import { ITradeInProfileRepository } from "../../ITradeInProfileRepository";
import { TradeInProfile } from "../../../../domain/sequelize/INv2/models/trade-in-profile.model";
import { getDbCxn } from "../../../../domain";

@injectable()
export class TradeInProfileRepository implements ITradeInProfileRepository {
    get profileRepo(): Repository<TradeInProfile> {
        const dbCxn = getDbCxn();
        if (dbCxn) {
            return dbCxn.getRepository(TradeInProfile);
        }
        if (TradeInProfile.sequelize) {
            return (TradeInProfile.sequelize as unknown as SequelizeTS).getRepository(TradeInProfile);
        }
        throw new Error('Database connection not available');
    }

    public async getProfileByUserId(userId: string, transaction?: Transaction): Promise<TradeInProfile | null> {
        return await this.profileRepo.findOne({
            where: { userId },
            transaction
        });
    }

    public async getProfileByUserIdAndProvider(userId: string, provider: string, transaction?: Transaction): Promise<TradeInProfile | null> {
        return await this.profileRepo.findOne({
            where: { userId, provider },
            transaction
        });
    }

    public async createProfile(data: any, transaction?: Transaction): Promise<TradeInProfile> {
        return await this.profileRepo.create(data, { transaction });
    }

    public async updateProfile(id: string, data: any, transaction?: Transaction): Promise<TradeInProfile | null> {
        const profile = await this.profileRepo.findByPk(id, { transaction });
        if (profile) {
            return await profile.update(data, { transaction });
        }
        return null;
    }
}
