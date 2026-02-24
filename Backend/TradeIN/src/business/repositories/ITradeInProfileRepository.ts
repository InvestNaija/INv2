import { TradeInProfile } from "../../domain/sequelize/INv2/models/trade-in-profile.model";
import { Transaction } from "sequelize";

export interface ITradeInProfileRepository {
    getProfileByUserId(userId: string, transaction?: Transaction): Promise<TradeInProfile | null>;
    getProfileByUserIdAndProvider(userId: string, provider: string, transaction?: Transaction): Promise<TradeInProfile | null>;
    createProfile(data: any, transaction?: Transaction): Promise<TradeInProfile>;
    updateProfile(id: string, data: any, transaction?: Transaction): Promise<TradeInProfile | null>;
}
