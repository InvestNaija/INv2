// ---------------------------------------------------------------------------
// Models for GET /3rd-party-services/po/offerings (IPO / Primary Offers)
// ---------------------------------------------------------------------------

export interface IPOAsset {
  asset_id: string;
  name: string;
  label: string;
  currency: string;
  unitPrice: number;
  yield: number;
  logo: string;
  type: string;
}

export interface IPOAssetType {
  type: string;
  label: string;
  description: string;
  Assets: IPOAsset[];
}

export interface IPOOfferingsResponse {
  success: boolean;
  status: number;
  message: string;
  data: IPOAssetType[];
}
