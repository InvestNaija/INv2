export enum OrderStatus {
   /**
    * Order is created, but the ticket it is trying to order has not yet been reserved
    */
   Created = 'created',
   /**
    * The ticket the order is trying to reserve has already been reserved, or when the user has cancelled the order
    * Or the order expires before payment
    */
   Cancelled = 'cancelled',
   /**
    * The order has successfully reserved the ticket
    */
   AwaitingPayment = 'awaiting:payment',
   /**
    * The order has reserved the ticket and user successfully made payment
    */
   Complete = 'complete'
}