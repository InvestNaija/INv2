import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTrade } from "../contexts/tradeContext";
import type { Security } from "../models/tradeModel";

// Shared watchlist state/actions — used by the trade details page's
// bookmark star, every Explore Securities tab's table (to know which rows
// are bookmarked), and the Watchlist tab itself (which also needs the full
// security data to render its rows) — so all of these stay consistent and
// only fetch once per mount instead of each place reimplementing it.
const useWatchlist = () => {
  const { fetchWatchlist: contextFetchWatchlist, addWatchlist, removeWatchlist } = useTrade();
  const [watchlist, setWatchlist] = useState<Security[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const fetchWatchlist = async () => {
    setIsLoading(true);
    try {
      const response = await contextFetchWatchlist();
      setWatchlist(response.data);
    } catch {
      // Non-critical for most callers of this hook (the star just won't
      // reflect watchlist state) — the Watchlist tab itself still shows a
      // toast via its own empty/error handling if it needs to.
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleWatchlistError = (error: unknown) => {
    const errorMessage = axios.isAxiosError(error)
      ? (error.response?.data?.message ?? error.message)
      : "Failed to update watchlist";
    toast.error(errorMessage);
  };

  const addBookmark = async (symbol: string) => {
    setIsMutating(true);
    try {
      await addWatchlist(symbol);
      await fetchWatchlist();
    } catch (error) {
      handleWatchlistError(error);
    } finally {
      setIsMutating(false);
    }
  };

  const removeBookmark = async (symbol: string) => {
    setIsMutating(true);
    try {
      await removeWatchlist(symbol);
      await fetchWatchlist();
    } catch (error) {
      handleWatchlistError(error);
    } finally {
      setIsMutating(false);
    }
  };

  const watchlistSecIds = watchlist.map((sec) => sec.secId);

  return {
    watchlist,
    watchlistSecIds,
    isLoading,
    isMutating,
    addBookmark,
    removeBookmark,
  };
};

export default useWatchlist;
