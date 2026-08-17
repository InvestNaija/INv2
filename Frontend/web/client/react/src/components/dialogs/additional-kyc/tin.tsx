import { useForm } from "react-hook-form";
import { tinSchema } from "./additional-kyc-validators";
import { yupResolver } from "@hookform/resolvers/yup";
import InputLabel from "../../atoms/input-with-label";
import Button from "../../atoms/buttons";



export interface TINDTO {
    tin: string;
}

interface TINProps {
  initialData: Partial<TINDTO>;
  onNext: (data: TINDTO) => void;
}


const TIN = ({ initialData, onNext }: TINProps) => {
  const { control, handleSubmit} = useForm({
    resolver: yupResolver(tinSchema),
    defaultValues: initialData as TINDTO
  });



    return (
        <>
         <div className="form-wrapper mt-[68px] px-[24px]">
              <form className="" onSubmit={handleSubmit(onNext)}>
                <div className="form-group">
                  <InputLabel
                    name="tin"
                    control={control}
                    label="Enter your TIN"
                    variant="outlined"
                  />
                </div>

                <div className="text-center mt-[87px] text-[12px] text-[#BFBFBF] font-medium leading-[16px] tracking-[0.2px]">
                    <span>Your TIN is issued by the FIRS or JTB.</span>
                </div>

                <div>
                  <Button
                    variant="primary"
                    disabled={false}
                    isLoading={false}
                    className="rounded-[99px] h-[56px] mt-[24px] text-[16px] font-semibold leading-[24px] tracking-[0.2px]"
                    type="submit"
                  >
                    Verify TIN
                  </Button>
                </div>
              </form>
            </div>
        
        </>
    )
}

export default TIN;