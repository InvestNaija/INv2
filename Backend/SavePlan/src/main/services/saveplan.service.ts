import { IResponse, } from "@inv2/common";

export class SaveplanService {
   async list(): Promise<IResponse> {
      return { success: true, code: 201, message: `User created successfully`, data: null };
   }
}