import { Outlet } from "react-router-dom";
import Header from "../../../components/organisms/header";

const Learn = () => {
    return (
        <>
          <div>
        <div className="learn-wrapper">
          <div className="header-wrapper">
            <Header></Header>
          </div>
        </div>
        <div className="mt-[54px]">
        <Outlet />
        </div>
      </div>
        </>
    )
}

export default Learn;