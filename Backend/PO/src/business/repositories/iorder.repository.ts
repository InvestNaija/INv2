import { Order } from "../../domain/sequelize/INv2/models/order.model";

export interface IOrderRepository {
   create(data: Partial<Order>): Promise<Order>;
   findById(id: string): Promise<Order | null>;
   updateStatus(id: string, status: string, authUrl?: string): Promise<[number, Order[]]>;
}
