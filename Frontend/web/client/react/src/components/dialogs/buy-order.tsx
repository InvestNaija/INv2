import AssetIcon from "../../assets/icons/fund-icon.svg";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { orderSchema } from "../../features/ui/invest/investments/details/funds-validators";
import type { BuyOrderDTO } from "../../features/ui/invest/investments/details/interface";
import Input from "../atoms/input";
import Button from "../atoms/buttons";
import formatCurrency from "../../hooks/FormatCurrency";
import { useState } from "react";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  Dialog,
  FormControl,
  Stepper,
  type DialogProps,
  Box,
  Typography,
} from "@mui/material";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 4,
  borderRadius: 4,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[800],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 4,
    backgroundColor: "#E77731",
    ...theme.applyStyles("dark", {
      backgroundColor: "#E77731",
    }),
  },
}));

interface BuyOrderProps {
  setBuyOrderDialog: (open: boolean) => void;
  openBuyOrderDialog: boolean;
}

const BuyOrders = (props: BuyOrderProps) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const staticUnitPrice: number[] = [10, 100, 200, 500, 1000];

  const updateUnitPrice = (unit: number) => {
    setValue("unit", unit, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleClose: DialogProps["onClose"] = (event, reason) => {
    if (reason !== "backdropClick") {
      props.setBuyOrderDialog(false);
    }
  };

  // initialize the form with react hook form and yup resolver for validation
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(orderSchema),
    defaultValues: {
      unit: undefined,
      frequency: "",
    },
    mode: "onChange",
  });

  // Handle form submission
  const onSubmit = async (data: BuyOrderDTO) => {
    handleNext();
    // await submitLogin(data);
  };

  return (
    <>
      <Dialog
        open={props.openBuyOrderDialog}
        onClose={handleClose}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(0px)", // Apply the blur effect
              // background: "#0F0F0F", // Add a semi-transparent background
              opacity: "0.5",
            },
          },
          paper: {
            sx: {
              backgroundColor: "#fff", // Change the background color
              borderRadius: "0", // Add rounded corners
              // padding: "34px 24px",
              //   width: "40%",
              //   minWidth: "90%",

              height: "100vh !important",
              maxHeight: "100vh !important",
              position: "absolute",
              top: "0",
              right: "0",
              margin: "0",
            },
          },
        }}
      >
        <Stepper activeStep={activeStep}>
          {/* {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))} */}
        </Stepper>
        <form className="" onSubmit={handleSubmit(onSubmit)}>
          {activeStep === 0 && (
            <div>
              <div>
                <div className="flex justify-start">
                  <span
                    className="text-[#0F0F0F] cursor-pointer  mx-[24px] my-[24px]"
                    onClick={() => props.setBuyOrderDialog(false)}
                  >
                    <i className="ri-close-fill text-[24px] leading-[28px]"></i>
                  </span>
                </div>
              </div>

              <div className="progress-bar-wrapper mb-[62px]">
                <BorderLinearProgress
                  variant="determinate"
                  value={33.3}
                  aria-label="Export data"
                />
              </div>
              <div>
                <div className="px-[25px] mt-[62px]">
                  <div className="create-order-header-wrapper">
                    <div className="text-center">
                      <span className="text-[#0F0F0F] text-[28px] leading-[40px] font-semibold tracking-[-0.3px]">
                        Create Order
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[#BFBFBF] text-[16px] leading-[24px] font-normal tracking-[-0.3px]">
                        Select a schedule that works for you.
                      </span>
                    </div>
                  </div>

                  <div className="form-control mt-[80px] w-full">
                    <FormControl
                      error={!!errors.frequency}
                      component="fieldset"
                    >
                      <Controller
                        name="frequency"
                        control={control}
                        rules={{ required: "Please select an option" }}
                        render={({ field }) => (
                          <RadioGroup {...field}>
                            <FormControlLabel
                              value="daily"
                              control={
                                <Radio
                                  sx={{
                                    color: "#BFBFBF",
                                    padding: "0", // Unchecked circle color
                                    "&.Mui-checked": {
                                      color: "#E6761A !important", // Checked circle color (Green)
                                    },
                                  }}
                                />
                              }
                              label={
                                <Box sx={{ padding: "16px 0px" }}>
                                  <Typography
                                    sx={{
                                      fontWeight: "600",
                                      fontSize: "18px",
                                      color: "#0F0F0F",
                                      lineHeight: "26px",
                                    }}
                                  >
                                    Daily
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontWeight: "400",
                                      fontSize: "16px",
                                      color: "#BFBFBF",
                                      lineHeight: "24px",
                                    }}
                                  >
                                    Every trading day (Monday - Friday)
                                  </Typography>
                                </Box>
                              }
                              labelPlacement="start"
                              sx={{
                                margin: "0",
                                // Adjust this value to increase or decrease space
                              }}
                            />
                            <FormControlLabel
                              value="weekly"
                              control={
                                <Radio
                                  sx={{
                                    color: "#BFBFBF",
                                    padding: "0", // Unchecked circle color
                                    "&.Mui-checked": {
                                      color: "#E6761A !important", // Checked circle color (Green)
                                    },
                                  }}
                                />
                              }
                              label={
                                <Box sx={{ padding: "16px 0px" }}>
                                  <Typography
                                    sx={{
                                      fontWeight: "600",
                                      fontSize: "18px",
                                      color: "#0F0F0F",
                                      lineHeight: "26px",
                                    }}
                                  >
                                    Weekly
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontWeight: "400",
                                      fontSize: "16px",
                                      color: "#BFBFBF",
                                      lineHeight: "24px",
                                    }}
                                  >
                                    Every week on Tuesday
                                  </Typography>
                                </Box>
                              }
                              labelPlacement="start"
                              sx={{
                                display: "flex",
                                margin: "0",
                                // Adjust this value to increase or decrease space
                              }}
                            />{" "}
                            <FormControlLabel
                              value="bi-weekly"
                              control={
                                <Radio
                                  sx={{
                                    color: "#BFBFBF",
                                    padding: "0", // Unchecked circle color
                                    "&.Mui-checked": {
                                      color: "#E6761A !important", // Checked circle color (Green)
                                    },
                                  }}
                                />
                              }
                              label={
                                <Box
                                  sx={{ width: "100%", padding: "16px 0px" }}
                                >
                                  <Typography
                                    sx={{
                                      fontWeight: "600",
                                      fontSize: "18px",
                                      color: "#0F0F0F",
                                      lineHeight: "26px",
                                    }}
                                  >
                                    Bi-weekly
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontWeight: "400",
                                      fontSize: "16px",
                                      color: "#BFBFBF",
                                      lineHeight: "24px",
                                    }}
                                  >
                                    Every two weeks on Tuesday
                                  </Typography>
                                </Box>
                              }
                              labelPlacement="start"
                              sx={{
                                display: "flex",
                                margin: "0",

                                // Adjust this value to increase or decrease space
                              }}
                            />{" "}
                            <FormControlLabel
                              value="monthly"
                              control={
                                <Radio
                                  sx={{
                                    color: "#BFBFBF",
                                    padding: "0", // Unchecked circle color
                                    "&.Mui-checked": {
                                      color: "#E6761A !important", // Checked circle color (Green)
                                    },
                                  }}
                                />
                              }
                              label={
                                <Box
                                  sx={{ width: "100%", padding: "16px 0px" }}
                                >
                                  <Typography
                                    sx={{
                                      fontWeight: "600",
                                      fontSize: "18px",
                                      color: "#0F0F0F",
                                      lineHeight: "26px",
                                    }}
                                  >
                                    Monthly
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontWeight: "400",
                                      fontSize: "16px",
                                      color: "#BFBFBF",
                                      lineHeight: "24px",
                                    }}
                                  >
                                    Every 1st of the month
                                  </Typography>
                                </Box>
                              }
                              labelPlacement="start"
                              sx={{
                                // display: "flex",
                                margin: "0",
                                // Adjust this value to increase or decrease space
                              }}
                            />
                          </RadioGroup>
                        )}
                      />
                    </FormControl>
                  </div>

                  <Button
                    variant="primary"
                    disabled={false}
                    isLoading={false}
                    className="rounded-[99px] h-[56px] mt-[48px] xs:w-sm sm:w-sm w-sm lg:w-md xl:w-md "
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div>
              <div>
                <div className="flex justify-start">
                  <div
                    onClick={handleBack}
                    className="cursor-pointer text-[#0F0F0F] cursor-pointer  mx-[24px] my-[24px]"
                  >
                    <i className="ri-arrow-left-line text-[24px] text-[#0F0F0F]"></i>
                  </div>
                </div>
              </div>

              <div className="progress-bar-wrapper mb-[62px]">
                <BorderLinearProgress
                  variant="determinate"
                  value={66.6}
                  aria-label="Export data"
                />
              </div>

              <div className="buy-Order-wrapper mt-[65px] px-[25px]">
                <div className=" flex justify-center">
                  <div>
                    <div>
                      <h3 className="text-[#0F0F0F] text-[20px] leading-[28px] font-semibold text-center w-sm">
                        Buy MMF on the 1st of every month
                      </h3>
                    </div>
                    <div className="flex justify-center mt-[61px]">
                      <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-white-500">
                        <img
                          src={AssetIcon}
                          height="64"
                          width="64"
                          alt="Asset Icon"
                        />
                      </div>
                    </div>
                    {/* <div className="mt-[18px]">
                  <span className="text-[#5A5A5A] text-[14px] leading-[20px] font-semibold text-center tracking-[0.1px]">
                    ₦100 per unit
                  </span>
                </div> */}
                  </div>
                </div>

                <div className="form-wrapper mt-[61px]">
                  <div className="">
                    <label className="mb-[12px] text-sm font-medium text-[#0F0F0F] tracking-[0.2px] leading-[20px] text-[14px]">
                      <div className="flex justify-between items-center">
                        <span>Amount in units</span>
                        <span>
                          {formatCurrency(
                            getValues("unit") * 100 || 0,
                            "NGN",
                            "en-NG",
                          )}
                        </span>
                      </div>
                    </label>
                    <Input
                      type="number"
                      {...register("unit")}
                      error={errors.unit?.message}
                      placeholder="Enter the number of units you want to buy"
                    />
                  </div>
                  <div className="grid xs:grid-cols-4 sm:grid-cols-4 grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-2 mt-[12px]">
                    {staticUnitPrice.map((price, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => updateUnitPrice(price)}
                        className={`cursor-pointer rounded-[99px] px-[8px] py-[8px] text-center text-[14px] font-bold transition-all duration-150 ${
                          getValues("unit") === price
                            ? "scale-[1.04] bg-[#00585E] text-white shadow-[0_4px_14px_rgba(0,88,94,0.3)]"
                            : "border-2 border-[#DCDCDC] bg-(--surface-subtle) text-(--text-content-default) hover:border-(--text-content-default) hover:bg-white"
                        }`}
                      >
                        {price} units
                      </button>
                    ))}
                  </div>
                  <div>
                    <Button
                      variant="primary"
                      disabled={false}
                      isLoading={false}
                      className="rounded-[99px] h-[56px] mt-[48px]"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="">
              <div className="flex justify-between items-center mx-[24px] my-[24px]">
                <div>
                  <div className="flex justify-start">
                    <div onClick={handleBack} className="cursor-pointer">
                      <i className="ri-arrow-left-line text-[24px] text-[#0F0F0F]"></i>
                    </div>
                  </div>
                </div>

                <div className="purchase-summary-wrapper">
                  <div className="text-center">
                    <h4 className="text-[16px] text-[#0F0F0F] font-semibold leading-[24px]">
                      Purchase Summary
                    </h4>
                  </div>
                </div>
                <div></div>
              </div>

              <div className="progress-bar-wrapper mb-[62px]">
                <BorderLinearProgress
                  variant="determinate"
                  value={100}
                  aria-label="Export data"
                />
              </div>

              <div className="mt-[65px] px-[25px]">
                <div className="flex justify-center">
                  <div className="info-wrapper xs:w-sm sm:w-sm w-sm lg:w-md xl:w-md ">
                    <div className="p-[24px] rounded-[12px] border border-[#F4F4F4]">
                      <div className="flex justify-center">
                        <div className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-white-500">
                          <img
                            src={AssetIcon}
                            height="64"
                            width="64"
                            alt="Asset Icon"
                          />
                        </div>
                      </div>
                      <div className="asset-name-wrapper mt-[16px]">
                        <h5 className="text-[16px] text-[#0F0F0F] font-semibold leading-[24px] text-center">
                          Money Market Order (MMF)
                        </h5>
                      </div>
                      <div className="asset-amount-brought-wrapper mt-[40px]">
                        <h5 className="text-[40px] text-[#0F0F0F] font-bold leading-[52px] text-center tracking-[-0.6px]">
                          ₦100,000.00
                        </h5>
                      </div>

                      <div className="mt-[40px]">
                        <div className="flex justify-between items-center py-[24px]">
                          <div>
                            <span className="text-[16px] text-[#1B1B1B] font-normal leading-[24px] ">
                              Unit price
                            </span>
                          </div>
                          <div>
                            <span className="text-[16px] text-right text-[#1B1B1B] font-semibold leading-[24px] ">
                              ₦100.00
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-[24px]">
                          <div>
                            <span className="text-[16px] text-[#1B1B1B] font-normal leading-[24px] ">
                              Total units
                            </span>
                          </div>
                          <div>
                            <span className="text-[16px] text-right text-[#1B1B1B] font-semibold leading-[24px] ">
                              1,000.00
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-[24px]">
                          <div>
                            <span className="text-[16px] text-[#1B1B1B] font-normal leading-[24px] ">
                              Fee
                            </span>
                          </div>
                          <div>
                            <span className="text-[16px] text-right text-[#1B1B1B] font-semibold leading-[24px] ">
                              ₦0.00
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-[24px]">
                          <div>
                            <span className="text-[16px] text-[#1B1B1B] font-normal leading-[24px] ">
                              Total amount
                            </span>
                          </div>
                          <div>
                            <span className="text-[16px] text-right text-[#1B1B1B] font-semibold leading-[24px] ">
                              ₦100,000.00
                            </span>
                          </div>
                        </div>

                        <div>
                          <Button
                            variant="primary"
                            disabled={false}
                            isLoading={false}
                            className="rounded-[99px] h-[56px] mt-[48px]"
                          >
                            Make payment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </Dialog>
    </>
  );
};

export default BuyOrders;
