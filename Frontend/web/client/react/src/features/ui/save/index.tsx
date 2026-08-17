import { Outlet } from "react-router-dom";
import Header from "../../../components/organisms/header";

const Save = () => {
  return (
    <>
      <div>
        <div className="save-wrapper">
          <div className="header-wrapper">
            <Header></Header>
          </div>
        </div>
        <div className="mt-[52px]">
        <Outlet />
        </div>
      </div>
    </>
  );
};

export default Save;
