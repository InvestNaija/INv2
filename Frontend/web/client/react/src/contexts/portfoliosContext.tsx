import { createContext, useContext, type ReactNode } from "react";
import usePortfolios, {
  type PortfolioFeatureType,
} from "../hooks/usePortfolios";

type PortfoliosContextValue = ReturnType<typeof usePortfolios>;

const PortfoliosContext = createContext<PortfoliosContextValue | null>(null);

interface PortfoliosProviderProps {
  type: PortfolioFeatureType;
  children: ReactNode;
}

// Wraps a single usePortfolios(type) instance in context so every page
// within a feature (Trade or Investments) shares the same selected
// portfolio — without this, each page calling usePortfolios(type)
// independently would default back to the first portfolio, ignoring
// whatever the customer picked on that feature's dashboard.
export const PortfoliosProvider = ({
  type,
  children,
}: PortfoliosProviderProps) => {
  const portfolios = usePortfolios(type);
  return (
    <PortfoliosContext.Provider value={portfolios}>
      {children}
    </PortfoliosContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePortfoliosContext = () => {
  const context = useContext(PortfoliosContext);
  if (!context) {
    throw new Error(
      "usePortfoliosContext must be used within a PortfoliosProvider",
    );
  }
  return context;
};
