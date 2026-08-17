import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import SecuritiesListTable from "../../../../../components/molecules/securities-list-table";
import SecuritySearchInput from "../../../../../components/molecules/security-search-input";
import type { SecurityListTableProps } from "./interface";
import { useTrade } from "../../../../../contexts/tradeContext";
import {
  filterSecuritiesByQuery,
  toSecurityTableRow,
} from "../../../../../hooks/securityHelpers";
import useWatchlist from "../../../../../hooks/useWatchlist";

// Today's top-losing securities, fetched live from the trades API
// (GET /trades/securities/performance?type=pl) — search and pagination
// both happen client-side once the list has arrived, same as All.
const Losers = () => {
  const { fetchSecuritiesPerformance } = useTrade();
  const [securities, setSecurities] = useState<SecurityListTableProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { watchlistSecIds, isMutating, addBookmark, removeBookmark } =
    useWatchlist();

  useEffect(() => {
    const fetchLosers = async () => {
      setIsLoading(true);
      try {
        const response = await fetchSecuritiesPerformance("pl");
        setSecurities(response.data.map(toSecurityTableRow));
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? (error.response?.data?.message ?? error.message)
          : "Failed to load losers";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLosers();
  }, []);

  const filteredSecurities = useMemo(
    () => filterSecuritiesByQuery(securities, searchTerm),
    [securities, searchTerm],
  );

  return (
    <div>
      <div className="mt-[24px] w-full sm:max-w-[420px]">
        <SecuritySearchInput value={searchTerm} onChange={setSearchTerm} />
        {searchTerm && !isLoading && (
          <p className="mt-[8px] text-[13px] text-(--text-content-muted) font-medium">
            {filteredSecurities.length} result
            {filteredSecurities.length === 1 ? "" : "s"} found
          </p>
        )}
      </div>
      <div className="mt-[16px]">
        <SecuritiesListTable
          tableData={filteredSecurities}
          isLoading={isLoading}
          watchlistSecIds={watchlistSecIds}
          onAddBookmark={addBookmark}
          onRemoveBookmark={removeBookmark}
          isMutatingWatchlist={isMutating}
        />
      </div>
    </div>
  );
};

export default Losers;
