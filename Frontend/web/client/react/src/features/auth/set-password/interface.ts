import type { User } from "../login/interface";

export interface SetPasswordDTO {
    password?: string | undefined;
    confirmPassword?: string | undefined;
}


export interface SetPasswordRO {
   user: User
}
