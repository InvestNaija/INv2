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

// Every tradeable security, fetched once in full (no page/size/search sent
// to the API) — pagination and search both happen client-side once the
// complete list has arrived, same as the Recommended tab.
const AllSecurities = () => {
  const { fetchSecurities } = useTrade();
  const [securities, setSecurities] = useState<SecurityListTableProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { watchlistSecIds, isMutating, addBookmark, removeBookmark } =
    useWatchlist();

  useEffect(() => {
    const loadSecurities = async () => {
      setIsLoading(true);
      try {
        const response = await fetchSecurities();
        setSecurities(response.data.map(toSecurityTableRow));
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? (error.response?.data?.message ?? error.message)
          : "Failed to load securities";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadSecurities();
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

export default AllSecurities;
