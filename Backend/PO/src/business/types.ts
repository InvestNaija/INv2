// Following SavePlan, we only define keys for Repositories and external clients here. Services bind to themselves.
export const TYPES = {
   IOfferingRepository: Symbol.for("IOfferingRepository"),
   IOrderRepository: Symbol.for("IOrderRepository")
};
