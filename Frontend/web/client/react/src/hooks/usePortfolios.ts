import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import type { Portfolio } from "../models/portfolioModel";
import { useTrade } from "../contexts/tradeContext";
import { useInvestment } from "../contexts/investmentsContext";
import {
  mergePortfolioDetail,
  mergeInvestmentPortfolioDetail,
} from "./portfolioHelpers";
import getVerificationMessage from "./getVerificationMessage";

export type PortfolioFeatureType = "trade" | "assets";

// Fetches the user's portfolios for either the Trade or Investments feature
// (same response shape, different endpoint) and tracks which one is
// currently selected — shared by both dashboards so the balance card and
// portfolio switcher behave identically in each place.
const usePortfolios = (type: PortfolioFeatureType) => {
  const { fetchTradePortfolios, fetchPortfolioById: fetchTradePortfolioById } = useTrade();
  const { fetchInvestmentPortfolios, fetchInvestmentPortfolioById } = useInvestment();

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolioState] =
    useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  // Set when the portfolios list fails specifically because some
  // onboarding step isn't done yet (backend replies with a
  // `{ error: { message: "Verify your bvn to proceed" } }`-shaped body) —
  // kept separate from `isError` so the dashboard can show a "go verify"
  // prompt instead of the generic failure state.
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  // GET /trades/portfolios/{id} (Trade) or GET /investin/portfolio-balance/
  // {id} (Investments) is the sole source of truth for the balance card's
  // figures (the list endpoint's own balance fields are a rougher
  // snapshot) — called for whichever portfolio is selected, both right
  // after the initial list load and again on every manual switch.
  const refreshBalance = async (portfolio: Portfolio) => {
    setIsRefreshingBalance(true);
    try {
      const merged =
        type === "trade"
          ? mergePortfolioDetail(
              portfolio,
              (await fetchTradePortfolioById(portfolio.id, portfolio.signature))
                .data,
            )
          : mergeInvestmentPortfolioDetail(
              portfolio,
              (
                await fetchInvestmentPortfolioById(
                  portfolio.id,
                  portfolio.signature,
                )
              ).data,
            );
      setSelectedPortfolioState(merged);
      setPortfolios((prev) =>
        prev.map((p) => (p.id === portfolio.id ? merged : p)),
      );
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.error?.message ??
            error.response?.data?.message ??
            error.message)
        : "Failed to refresh portfolio balance";
      toast.error(errorMessage);
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  const fetchPortfolios = async () => {
    setIsLoading(true);
    setIsError(false);
    setVerificationMessage(null);
    try {
      const { data } =
        type === "trade"
          ? await fetchTradePortfolios()
          : await fetchInvestmentPortfolios();
      setPortfolios(data);
      const firstPortfolio = data[0] ?? null;
      setSelectedPortfolioState(firstPortfolio);
      if (firstPortfolio) {
        await refreshBalance(firstPortfolio);
      }
    } catch (error) {
      // Silent — a failed /trades/portfolios or /investin/portfolios fetch
      // (e.g. no portfolio yet) just falls back to the dashboard's empty
      // state via `isError`, no toast. The one exception is an unfinished
      // onboarding step (e.g. "Verify your bvn to proceed") — that's
      // actionable, so it's surfaced as its own state instead of the
      // generic failure one.
      const message = getVerificationMessage(error);
      if (message) {
        setVerificationMessage(message);
      } else {
        setIsError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const setSelectedPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolioState(portfolio);
    refreshBalance(portfolio);
  };

  return {
    portfolios,
    selectedPortfolio,
    setSelectedPortfolio,
    isLoading,
    isError,
    verificationMessage,
    isRefreshingBalance,
    refetch: fetchPortfolios,
  };
};

export default usePortfolios;
