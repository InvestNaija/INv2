import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { PortfoliosProvider } from "../../../../contexts/portfoliosContext";
import { useUser } from "../../../../contexts/userContext";

const Trade = () => {
  const { currentUser } = useUser();
  const isMinor = Boolean(currentUser?.isMinor);

  useEffect(() => {
    if (isMinor) {
      toast.error("Trading isn't available on a dependent account.");
    }
  }, [isMinor]);

  // Single chokepoint for every Trade sub-route (dashboard, details,
  // breakdown) regardless of how it was reached — a redirect here blocks
  // direct URL entry too, not just the in-app nav links into Trade.
  if (isMinor) {
    return <Navigate to="/app/invest/investments/dashboard" replace />;
  }

  return (
    <PortfoliosProvider type="trade">
      <div>
        <Outlet />
      </div>
    </PortfoliosProvider>
  );
};

export default Trade;
