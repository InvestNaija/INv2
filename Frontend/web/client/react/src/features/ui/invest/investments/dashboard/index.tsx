import AssetsList from "../assets-list";
import { usePortfoliosContext } from "../../../../../contexts/portfoliosContext";
import PortfolioBalanceCard from "../../../../../components/organisms/portfolio-balance-card";
import PortfolioHoldingsList from "../../../../../components/organisms/portfolio-holdings-list";


const InvestmentDashboard = () => {
  const {
    portfolios,
    selectedPortfolio,
    setSelectedPortfolio,
    isLoading,
    isError,
    verificationMessage,
    isRefreshingBalance,
    refetch,
  } = usePortfoliosContext();

  return (
    <>
      <div className="dashboard-wrapper mt-[48px]">
        <div className="grid xs:grid-cols-1 sm:grid-cols-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          <div className="col-span-2 h-full">
            <div className="col-1-wrapper h-full">
              <PortfolioBalanceCard
                portfolios={portfolios}
                selectedPortfolio={selectedPortfolio}
                onSelectPortfolio={setSelectedPortfolio}
                isLoading={isLoading}
                isError={isError}
                verificationMessage={verificationMessage}
                isRefreshingBalance={isRefreshingBalance}
                onRetry={refetch}
                breakdownHref="/app/invest/investments/breakdown"
                compact
              />
            </div>
          </div>
          <div className="sm:col-span-2 xs:col-span-2 col-span-2 md:col-span-1 lg:col-span-1 xl:col-span-1">
            <PortfolioHoldingsList
              holdings={selectedPortfolio?.portfolioHoldings ?? []}
              isLoading={isLoading || isRefreshingBalance}
              seeAllHref="/app/invest/investments/breakdown"
              detailsBasePath="/app/invest/investments/details"
              name={"My Holdings"}
            />
          </div>
        </div>


        <div className="mt-[64px]">
          <div className="funds-wrapper">
            <AssetsList showSeeAll={true} />
          </div>
        </div>
      </div>
    </>
  );
};

export default InvestmentDashboard;
