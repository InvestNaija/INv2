import { Transaction } from "sequelize";

export interface ISecurityRepository {
    transaction(): Promise<Transaction>;
    commit(t: Transaction): Promise<void>;
    rollback(t: Transaction): Promise<void>;
    createSecurity(securityData: any, transaction?: Transaction): Promise<any>;
    getSecurityById(id: string, transaction?: Transaction, includes?: any[]): Promise<any>;
    getSecurityBySymbolAndCustomer(symbol: string, customerId: string, transaction?: Transaction): Promise<any>;
    getWatchlist(customerId: string, transaction?: Transaction): Promise<any[]>;
    getRecommended(transaction?: Transaction): Promise<any[]>;
    updateSecurity(id: string, securityData: any, transaction?: Transaction): Promise<any>;
    deleteSecurity(id: string, transaction?: Transaction): Promise<void>;
    deleteFromWatchlist(symbol: string, customerId: string, transaction?: Transaction): Promise<void>;
}
