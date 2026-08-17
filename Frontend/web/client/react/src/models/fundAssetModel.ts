// ---------------------------------------------------------------------------
// Models for GET https://funds-chd.zanibal.com/api/v2/service-route/get-assets?t=FUND
// ---------------------------------------------------------------------------

export interface AssetSetting {
  asset_setting_id: string;
  asset_id: string;
  key: string;
  value: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FundAsset {
  id: number;
  active: boolean;
  name: string;
  label: string;
  cashAccountControlId: number;
  index: boolean;
  marginable: boolean;
  yield: number;
  bidPrice: number;
  offerPrice: number;
  instrumentType: string;
  assetCategory: string;
  baseCurrency: string;
  instrumentClass: string;
  nominalValue: number;
  currentValue: number;
  currentValueDate: number;
  sector: string;
  securityExchange: string;
  currOutstandQuant: number;
  fundState: string;
  popularity: number;
  asset_id: string;
  description: string;
  external_identifier: string;
  type_id: string;
  anticipatedMaxPrice: string;
  anticipatedMinPrice: string;
  sharePrice: string;
  availableShares: number;
  openForPurchase: boolean;
  openingDate: string;
  closingDate: string;
  maturityDate: string | null;
  image: string;
  asset_code: string;
  currency: string;
  minimumNoOfUnits: number;
  sendReservationEmail: boolean | null;
  paymentLabel: string | null;
  paymentLogo: string | null;
  logo: string;
  subsequentMinAmount: number;
  allocationDate: string | null;
  fundingDate: string | null;
  bank_details: string | null;
  category_range: string;
  subsequentMultipleUnit: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  AssetSettings: AssetSetting[];
}

export interface FundAssetType {
  type_id: string;
  type: string;
  label: string | null;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  Assets: FundAsset[];
}

export interface FundAssetsResponse {
  status: number;
  success: boolean;
  message: string;
  data: FundAssetType[];
}

export interface AssetBankDetail {
  sub_account_id: string | null;
  bank_name: string;
  account_number: string;
  gateway: string;
  name_on_account: string;
  redemption_account: string | null;
}

export interface FundAssetDetail extends FundAsset {
  AssetType?: {
    type_id: string;
    type: string;
    label: string | null;
    description: string;
    image: string;
    createdAt: string;
    updatedAt: string;
  };
  AssetBanksDetails?: AssetBankDetail[];
  initialPurchaseAmount?: number;
}

export interface FundAssetDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: FundAssetDetail;
}

export interface FundAssetBalance {
  active: boolean;
  securityId: number;
  companyName: string;
  symbol: string;
  sector: string;
  assetClass: string;
  assetCategory: string;
  marketPrice: number;
  dailyIncome: number;
  marketPriceLC: number;
  marketPriceFC: number;
  quantity: number;
  pendingBonus: number;
  pendingDividends: number;
  unitCost: number;
  portPercentage: number;
  invstCurrency: string;
  conversionRate: number;
  maturityYears: number;
  investmentCurrency: string;
  investedAmount: number;
  investedAmountReport: number;
  witholdingTaxRate: number;
  effectiveCouponRate: number;
  yieldToMaturity: number;
  currentYield: number;
  effectiveSwapCouponRate: number;
  feeRate: number;
  bondCleanPrice: number;
  bondDirtyPrice: number;
  bondCleanValue: number;
  bondDirtyValue: number;
  bondAccruedCoupon: number;
  bondFaceValue: number;
  lcSpotRate: number;
  fcSpotRate: number;
  lcSpotValue: number;
  fcSpotValue: number;
  fcCurrValue: number;
  fcSpotOutstanding: number;
  lcOutstanding: number;
  currentSpotRate: number;
  duration: number;
  modifiedDuration: number;
  carryingValue: number;
  currentValueLC: number;
  currentValueFC: number;
  currentValue: number;
  netPosition: number;
  totalUnitsHeld: number;
  totalPurchaseCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  // it extends other properties too but these are the main holding ones
}

export interface FundAssetBalanceResponse {
  status: number;
  success: boolean;
  message: string;
  data: FundAssetBalance;
}

export interface FundTransaction {
  id: number;
  active: boolean;
  name: string;
  label: string;
  description: string;
  transType: string;
  orderBase: string;
  status: string;
  batchName: string;
  fundId: number;
  fundName: string;
  fundLabel: string;
  customerId: number;
  customerName: string;
  customerLabel: string;
  portfolioId: number;
  portfolioName: string;
  portfolioLabel: string;
  transactionDate: number;
  orderDate: number;
  currency: string;
  transUnits: number;
  transAmount: number;
  unitPrice: number;
  transPrice: number;
  transConsideration: number;
  transPenalty: number;
  transValue: number;
}

export interface FundTransactionResponse {
  success: boolean;
  status: number;
  count: number;
  data: FundTransaction[];
}
