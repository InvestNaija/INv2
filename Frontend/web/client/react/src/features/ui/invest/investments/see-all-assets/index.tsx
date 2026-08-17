import Back from "../../../../../components/molecules/back";
import AssetsList from "../assets-list";



const AllAssets = () => {
    return (
        <>
          <div className="all-assets-wrapper mt-[40px]">
              <div className="flex flex-start">
                    <Back name="Back"/>
              </div>

              <div className="mt-[32px]">
                <div className="funds-wrapper">
                <AssetsList  showSeeAll={false}/>
             </div>
              </div>
          </div>
        </>
    )
}

export default AllAssets;