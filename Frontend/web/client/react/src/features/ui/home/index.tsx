import { useEffect, useState } from "react";
import Header from "../../../components/organisms/header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import convertToTitleCase from "../../../hooks/convertToTitleCase";
import HomeFeatures from "../../../contexts/homeContext";
import TransactionFeatures from "../../../contexts/transactionContext";

const Home = () => {
    // navigate and get url path
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Overview");
  const tabList = ["Overview", "Portfolio", "Wallet"];

  // Split the pathname and filter out empty strings (like the trailing slash)
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Get the last item in the array
  const lastPath = pathSegments[pathSegments.length - 1];


  const onTabClick = (tab: string) => {
    setActiveTab(tab);

    if (tab === "Overview") {
      navigate("overview");
    } else if (tab === "Portfolio") {
      navigate("portfolio");
    } else if (tab === "Wallet") {
      navigate("wallet");
    } else {
        navigate("overview");
    }
  };

  useEffect(() => {
    const refreshTabClick = () => {
      onTabClick(convertToTitleCase(lastPath));
    };

    refreshTabClick();
  }, [lastPath]);

  return (
    <HomeFeatures>
    <TransactionFeatures>
      <div className="home-wrapper">
        <div className="header-wrapper">
          <Header></Header>
        </div>

        <div className="home-body-wrapper mt-[52px]">
          <div className="home-body-tab-wrapper flex gap-[16px]">
            {tabList.map((tab) => (
              <div
                key={tab}
                className={`py-[8px] px-[16px] flex items-center cursor-pointer capitalize text-[#0f0f0f] text-[14px] font-medium leading-[20px] tracking-[0.1px] ${activeTab === tab ? "bg-[#00585E] border  rounded-[20px] text-white" : ""}`}
                onClick={() => onTabClick(tab)}
              >
                {tab}
              </div>
            ))}
          </div>

          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </TransactionFeatures>
    </HomeFeatures>
  );
};

export default Home;
