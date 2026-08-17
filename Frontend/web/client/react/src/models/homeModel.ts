// Matches the real /customers/dashboard/new-products response.
export interface NewProduct {
  id: string;
  image: string;
  logo?: string;
  title: string;
  description: string;
  provider: string;
  type: string;
  module: string;
  priceFormatted?: string;
  returnFormatted?: string;
  riskLevel?: string;
  shortName?: string;
}

export interface NewProductsResponse {
  code: number;
  status: string;
  message: string;
  data: NewProduct[];
}

// State shape backing HomeContext (see contexts/homeContext.tsx).
export interface HomeState {
  newProducts: NewProduct[];
  exploreInvestments: NewProduct[];
  isLoading: boolean;
}

// Actions handled by homeContext's reducer.
export type HomeAction =
  | { type: "FETCH_NEW_PRODUCTS_START" }
  | { type: "FETCH_NEW_PRODUCTS_SUCCESS"; payload: { newProducts: NewProduct[]; exploreInvestments: NewProduct[] } }
  | { type: "FETCH_NEW_PRODUCTS_FAILURE" };

// Shape of the value HomeContext.Provider exposes to consumers.
export interface HomeContextType {
  newProducts: NewProduct[];
  exploreInvestments: NewProduct[];
  isLoading: boolean;
}
