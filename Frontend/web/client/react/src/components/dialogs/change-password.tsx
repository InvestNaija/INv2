import { Dialog, type DialogProps } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import Label from "../atoms/labels";
import Input from "../atoms/input";
import Button from "../atoms/buttons";
import { useAuth } from "../../contexts/authContext";
import { encryptPassword } from "../../hooks/encryption";

interface ChangePasswordProps {
  openDialog: boolean;
  setDialog: (open: boolean) => void;
}

interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Same strength rules as create-password-validators.ts, applied here to
// the new password.
const schema = yup.object().shape({
  oldPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character",
    ),
  confirmNewPassword: yup
    .string()
    .required("Please confirm your new password")
    .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

const ChangePassword = (props: ChangePasswordProps) => {
  const { submitChangePassword } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordDTO>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const handleDialogClose: DialogProps["onClose"] = (_event, reason) => {
    if (reason !== "backdropClick") {
      props.setDialog(false);
    }
  };

  const onSubmit = async (data: ChangePasswordDTO) => {
    try {
      const publicKey = import.meta.env.VITE_PUBLIC_KEY;
      const [oldPassword, newPassword, confirmNewPassword] = await Promise.all([
        encryptPassword(data.oldPassword, publicKey),
        encryptPassword(data.newPassword, publicKey),
        encryptPassword(data.confirmNewPassword, publicKey),
      ]);

      await submitChangePassword({ oldPassword, newPassword, confirmNewPassword });
      toast.success("Password changed successfully");
      reset();
      props.setDialog(false);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
           error.response?.data?.error?.message ??
           error.message)
        : "Failed to change password";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog
      open={props.openDialog}
      onClose={handleDialogClose}
      slotProps={{
        transition: { onEnter: () => reset() },
        backdrop: {
          sx: {
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(15, 15, 15, 0.45)",
          },
        },
        paper: {
          sx: {
            backgroundColor: "var(--surface-default)",
            borderRadius: { xs: "20px", sm: "24px" },
            width: "440px",
            maxWidth: { xs: "calc(100% - 24px)", sm: "calc(100% - 32px)" },
            maxHeight: { xs: "calc(100dvh - 24px)", sm: "calc(100% - 64px)" },
            margin: { xs: "12px", sm: "32px" },
            overflowY: "auto",
            padding: { xs: "24px 16px", sm: "34px 24px" },
          },
        },
      }}
    >
      <div>
        <div className="flex justify-end">
          <span
            className="text-(--text-content-default) cursor-pointer bg-(--surface-subtle) border border-(--border-default) rounded-[999px] px-[9px] py-[6px] transition-transform active:scale-90"
            onClick={() => props.setDialog(false)}
          >
            <i className="ri-close-fill text-[24px] leading-[28px]"></i>
          </span>
        </div>

        <div className="mt-[12px]">
          <h2 className="text-[22px] sm:text-[28px] font-semibold text-(--text-content-default) leading-[30px] sm:leading-[40px] tracking-[-0.3px]">
            Change password
          </h2>
          <p className="mt-[8px] text-(--text-content-muted) text-[13px] sm:text-[14px] leading-[19px] sm:leading-[20px] font-medium">
            Enter your current password and choose a new one.
          </p>
        </div>

        <form className="mt-[32px]" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label name="Current password" />
            <Input
              type="password"
              error={errors.oldPassword?.message}
              {...register("oldPassword")}
              placeholder="Enter current password"
            />
          </div>

          <div className="mt-[20px]">
            <Label name="New password" />
            <Input
              type="password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
              placeholder="Enter new password"
            />
          </div>

          <div className="mt-[20px]">
            <Label name="Confirm new password" />
            <Input
              type="password"
              error={errors.confirmNewPassword?.message}
              {...register("confirmNewPassword")}
              placeholder="Re-enter new password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="rounded-[99px] h-[56px] mt-[32px] w-full transition-transform active:scale-[0.98]"
          >
            Change password
          </Button>
        </form>
      </div>
    </Dialog>
  );
};

export default ChangePassword;
