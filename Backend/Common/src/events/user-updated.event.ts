import { Subjects } from "./subjects";
import { UserTenantRoleDto } from "../_dtos";

export interface UserUpdatedEvent {
   subject: Subjects.UserUpdated;
   data: Partial<UserTenantRoleDto>;
}