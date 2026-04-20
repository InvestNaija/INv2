
// file types.ts
export const TYPES = {
   IUserRepository: Symbol.for("IUserRepository"),
   UserService: Symbol.for("UserService"),
   AuthService: Symbol.for("AuthService"),
   RoleService: Symbol.for("RoleService"),
   TenantService: Symbol.for("TenantService"),
   HolidayService: Symbol.for("HolidayService"),
   HolidayController: Symbol.for("HolidayController"),
   AuthController: Symbol.for("AuthController"),
   GrpcServer: Symbol.for('GrpcServer'),
   GRPHolidayService: Symbol.for("GRPHolidayService"),
   AuthMiddleware: Symbol.for("AuthMiddleware"),
   PasswordHistoryService: Symbol.for("PasswordHistoryService"),
   IPasswordHistoryRepository: Symbol.for("IPasswordHistoryRepository"),
};