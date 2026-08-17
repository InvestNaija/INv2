import AssetsListCard from "../../../../../components/molecules/assets-list-card";
import type { AssetsListCardProps } from "./interface";



const Funds = (props: { fundList: AssetsListCardProps[] } ) => {


    return (
        <>
        <div>
            <div className="grid xs:grid-cols-1 sm:grid-cols-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {props.fundList.map((fund, index) => (
                    <AssetsListCard key={index} {...fund} />
                ))}
            </div>
        </div>
        </>
    )
}


export default Funds;