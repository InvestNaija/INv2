import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import SecuritiesListTable from "../../../../../components/molecules/securities-list-table";
import type { SecurityListTableProps } from "./interface";
import { useTrade } from "../../../../../contexts/tradeContext";
import { toSecurityTableRow } from "../../../../../hooks/securityHelpers";
import useWatchlist from "../../../../../hooks/useWatchlist";

// Recommended securities fetched live from the trades API.
const Recommended = () => {
  const { fetchRecommendedSecurities } = useTrade();
  const [securities, setSecurities] = useState<SecurityListTableProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { watchlistSecIds, isMutating, addBookmark, removeBookmark } =
    useWatchlist();

  useEffect(() => {
    const fetchRecommended = async () => {
      setIsLoading(true);
      try {
        const response = await fetchRecommendedSecurities();
        setSecurities(response.data.map(toSecurityTableRow));
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? (error.response?.data?.message ?? error.message)
          : "Failed to load recommended securities";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommended();
  }, []);

  return (
    <div>
      <div className="mt-[24px]">
        <SecuritiesListTable
          tableData={securities}
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

export default Recommended;
