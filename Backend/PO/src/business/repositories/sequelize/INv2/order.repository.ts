import { injectable } from "inversify";
import { IOrderRepository } from "../../iorder.repository";
import { Order } from "../../../../domain/sequelize/INv2/models/order.model";

@injectable()
export class OrderRepository implements IOrderRepository {
   async create(data: Partial<Order>): Promise<Order> {
      return await Order.create(data as any);
   }

   async findById(id: string): Promise<Order | null> {
      return await Order.findByPk(id, { include: ['offering'] });
   }

   async updateStatus(id: string, status: string, authUrl?: string): Promise<[number, Order[]]> {
      const payload: any = { status };
      if (authUrl) payload.authorizationUrl = authUrl;
      return await Order.update(payload, { where: { id }, returning: true });
   }
}
