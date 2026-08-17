import { useMemo } from "react";
import SecuritiesListTable from "../../../../../components/molecules/securities-list-table";
import { toSecurityTableRow } from "../../../../../hooks/securityHelpers";
import useWatchlist from "../../../../../hooks/useWatchlist";

// Watched securities — reuses the same shared watchlist hook as the star
// icon on every other tab/the trade details page, so adding/removing here
// stays in sync with everywhere else.
const Watchlist = () => {
  const { watchlist, watchlistSecIds, isLoading, isMutating, removeBookmark } =
    useWatchlist();

  const securities = useMemo(
    () => watchlist.map(toSecurityTableRow),
    [watchlist],
  );

  return (
    <div>
      <div className="mt-[24px]">
        <SecuritiesListTable
          tableData={securities}
          isLoading={isLoading}
          watchlistSecIds={watchlistSecIds}
          onRemoveBookmark={removeBookmark}
          isMutatingWatchlist={isMutating}
        />
      </div>
    </div>
  );
};

export default Watchlist;
