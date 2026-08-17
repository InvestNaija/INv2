import type { User } from "../login/interface";

export interface CreatePasswordDTO {
    password?: string | undefined;
    confirmPassword?: string | undefined;
}


export interface CreatePasswordRO {
   user: User
}
