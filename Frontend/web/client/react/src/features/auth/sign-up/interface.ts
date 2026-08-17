export interface User {
  id: string;
  name: string;
  email: string;
}



export interface SignupDTO {
    email?: string | undefined;
    password?: string | undefined;
    // remember?: boolean | undefined;
}


export interface SignupRO {
   user: User
   token?: string | null | undefined;
}
