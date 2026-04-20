/**
 * AssetSubscriptionDto
 * Data transfer object for initiating a fund subscription.
 */
export interface AssetSubscriptionDto {
   /** The unique code representing the investment asset */
   assetCode: string;
   /** The amount to be invested in the fund */
   amount: number;
   /** The ID of the portfolio to which the asset will be added */
   portfolioId: string;
   /** The currency of the transaction (defaults to asset currency if not provided) */
   currency?: string;
   /** The payment gateway to be used (e.g., 'paystack', 'flutterwave') */
   gateway?: string;
   /** Optional callback parameters for the payment processing */
   callbackParams?: Record<string, any>;
}

/**
 * AssetRedemptionDto
 * Data transfer object for initiating a fund redemption (sell).
 */
export interface AssetRedemptionDto {
   /** The unique code representing the investment asset */
   assetCode: string;
   /** The amount to be invested in the fund */
   amount: number;
   /** The number of units to redeem from the fund */
   transUnits: number;
   /** The ID of the portfolio from which the asset will be redeemed */
   portfolioId: string;
   /** The currency of the transaction */
   currency?: string;
}

/**
 * PostTransactionDto
 * Data transfer object for finalizing/posting a transaction.
 */
export interface PostTransactionDto {
   /** The transaction ID provided by the vendor (Zanibal) or payment gateway */
   txnId: string;
}
