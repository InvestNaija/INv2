import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { IPasswordHistoryRepository } from "../repositories/IPasswordHistoryRepository";
import { PasswordManager } from "../../_utils/PasswordManager";
import { Transaction } from "sequelize";

@injectable()
export class PasswordHistoryService {
   constructor(
      @inject(TYPES.IPasswordHistoryRepository)
      private readonly historyRepo: IPasswordHistoryRepository
   ) {}

   private readonly DEPTH = parseInt(process.env.PASSWORD_HISTORY_DEPTH || "5");

   /**
    * Records a password hash in the history.
    */
   async recordPassword(userId: string, passwordHash: string, transaction?: Transaction) {
      await this.historyRepo.create({ userId, passwordHash }, transaction);
   }

   /**
    * Checks if the new password has been used recently.
    * Returns true if reused, false otherwise.
    */
   async isPasswordReused(userId: string, newPassword: string, currentPasswordHash: string): Promise<boolean> {
      // 1. Check against current password
      const matchesCurrent = await PasswordManager.compare(currentPasswordHash, newPassword);
      if (matchesCurrent) return true;

      // 2. Check against last N entries in history
      const history = await this.historyRepo.findLastN(userId, this.DEPTH);
      for (const entry of history) {
         if (await PasswordManager.compare(entry.passwordHash, newPassword)) {
            return true;
         }
      }

      return false;
   }
}
