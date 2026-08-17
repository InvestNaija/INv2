import { createContext, useContext, useEffect, useReducer } from "react";
import { getNewProducts } from "../api/homeService";
import { useSave } from "./saveContext";
import { useTrade } from "./tradeContext";
import { useInvestment } from "./investmentsContext";
import formatCurrency from "../hooks/FormatCurrency";
import type {
  HomeAction,
  HomeContextType,
  HomeState,
  NewProduct,
  NewProductsResponse,
} from "../models/homeModel";

export type { HomeAction, HomeContextType, HomeState, NewProduct, NewProductsResponse };

const formatWholeCurrency = (amount: number, currencyCode = 'NGN') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const initialState: HomeState = {
  newProducts: [],
  exploreInvestments: [],
  isLoading: false,
};

const homeReducer = (state: HomeState, action: HomeAction): HomeState => {
  switch (action.type) {
    case "FETCH_NEW_PRODUCTS_START":
      return { ...state, isLoading: true };
    case "FETCH_NEW_PRODUCTS_SUCCESS":
      return { 
        ...state, 
        isLoading: false, 
        newProducts: action.payload.newProducts,
        exploreInvestments: action.payload.exploreInvestments
      };
    case "FETCH_NEW_PRODUCTS_FAILURE":
      return { ...state, isLoading: false };
    default:
      return state;
  }
};

const HomeContexts = createContext<HomeContextType | undefined>(undefined);

export default function HomeFeatures({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(homeReducer, initialState);
  const { fetchPlaninList, fetchSaveinList } = useSave();
  const { fetchRecommendedSecurities } = useTrade();
  const { fetchFundAssets } = useInvestment();

  useEffect(() => {
    const fetchNewProducts = async () => {
      dispatch({ type: "FETCH_NEW_PRODUCTS_START" });
      try {
        let combined: NewProduct[] = [];
        let fetchedNewProducts: NewProduct[] = [];

        try {
          const response = await getNewProducts();
          if (response?.data) {
            fetchedNewProducts = response.data;
          }
        } catch (e) {
          console.error("Failed to fetch new products", e);
        }

        try {
          const [planinRes, saveinRes] = await Promise.allSettled([
            fetchPlaninList(),
            fetchSaveinList()
          ]);

          let combinedSaves: any[] = [];
          if (planinRes.status === "fulfilled" && planinRes.value.success) {
            combinedSaves = [...combinedSaves, ...planinRes.value.data.rows];
          }
          if (saveinRes.status === "fulfilled" && saveinRes.value.success) {
            combinedSaves = [...combinedSaves, ...saveinRes.value.data.rows];
          }

          if (combinedSaves.length > 0) {
            // Sort to ensure 100m65 is at the top
            const sortPriority = (title: string) => {
              const t = title.toLowerCase();
              if (t.includes("100m65")) return 1;
              return 99;
            };
            
            combinedSaves.sort((a, b) => sortPriority(a.title) - sortPriority(b.title));

            const saves = combinedSaves
              .filter(s => !s.title.toLowerCase().includes("save a million"))
              .slice(0, 5)
              .map((s) => {
                return {
                  id: String(s.id),
                  title: s.title,
                  description: s.description,
                  image: s.logo || s.icon || "",
                  provider: "InvestNaija",
                  type: "Saving",
                  module: "Save",
                  priceFormatted: formatWholeCurrency(s.min_amount || 0, s.currency || "NGN"),
                  returnFormatted: s.interest_rate != null ? `${Math.round(Number(s.interest_rate))}%` : undefined,
                  riskLevel: "Low risk",
                  shortName: s.title.substring(0, 2).toUpperCase()
                };
              });
            combined = [...combined, ...saves];
          }
        } catch (e) {
          console.error("Failed to fetch saves for home", e);
        }

        try {
          const fundRes = await fetchFundAssets();
          if (fundRes?.data?.[0]?.Assets) {
            const funds = fundRes.data[0].Assets.slice(0, 5).map((f: any) => {
              let type = "Fund";
              let riskLevel = "Medium risk";
              if (f.name.toLowerCase().includes("sukuk") || f.name.toLowerCase().includes("bond")) {
                type = "Bond";
                riskLevel = "Low risk";
              }
              return {
                id: String(f.asset_id || f.id),
                title: f.asset_code || f.name,
                description: f.label || "Mutual Fund",
                image: f.logo || f.image || "",
                provider: "InvestNaija",
                type: type,
                module: "Invest",
                priceFormatted: formatWholeCurrency(f.nominalValue || f.minimumNoOfUnits || 0, f.currency || "NGN"),
                returnFormatted: f.yield != null ? `APY ${Math.round(Number(f.yield))}%` : undefined,
                riskLevel: riskLevel,
                shortName: f.asset_code || f.name.substring(0, 2).toUpperCase()
              };
            });
            combined = [...combined, ...funds];
          }
        } catch (e) {
          console.error("Failed to fetch funds for home", e);
        }

        try {
          const secRes = await fetchRecommendedSecurities();
          if (secRes?.data) {
            const trades = secRes.data.slice(0, 5).map((t: any) => ({
              id: t.secId || t.symbol,
              title: t.symbol,
              description: t.secDesc,
              image: t.imageUrl || "",
              provider: "NGX",
              type: "Stock",
              module: "Trade",
              priceFormatted: formatWholeCurrency(t.lastPx || t.price || t.close || 0, t.currency || "NGN"),
              returnFormatted: t.netChgPrevDayPerc != null ? `${Math.round(Number(t.netChgPrevDayPerc))}%` : undefined,
              riskLevel: "High risk",
              shortName: t.symbol
            }));
            combined = [...combined, ...trades];
          }
        } catch (e) {
          console.error("Failed to fetch recommended trades for home", e);
        }

        // Randomize the items
        combined = combined.sort(() => Math.random() - 0.5);

        dispatch({ 
          type: "FETCH_NEW_PRODUCTS_SUCCESS", 
          payload: { 
            newProducts: fetchedNewProducts, 
            exploreInvestments: combined 
          } 
        });
      } catch (err) {
        dispatch({ type: "FETCH_NEW_PRODUCTS_FAILURE" });
      }
    };

    fetchNewProducts();
  }, []);

  return (
    <HomeContexts.Provider
      value={{ 
        newProducts: state.newProducts, 
        exploreInvestments: state.exploreInvestments,
        isLoading: state.isLoading 
      }}
    >
      {children}
    </HomeContexts.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useHomeFeatures() {
  const context = useContext(HomeContexts);

  if (context === undefined) {
    throw new Error("useHomeFeatures must be used within a HomeFeatures provider");
  }

  return context;
}
