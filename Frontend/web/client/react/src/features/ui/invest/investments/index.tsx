import { Outlet } from "react-router-dom";
import { PortfoliosProvider } from "../../../../contexts/portfoliosContext";

const Investments = () => {
  // navigate and get url path
  return (
    <PortfoliosProvider type="assets">
      <div>
        <Outlet />
      </div>
    </PortfoliosProvider>
  );
};

export default Investments;
