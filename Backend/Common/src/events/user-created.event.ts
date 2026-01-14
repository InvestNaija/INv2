import { Subjects } from "./subjects";
import {  UserTenantRoleDto } from "../_dtos";

export interface UserCreatedEvent {
   subject: Subjects.UserCreated;
   data: Partial<UserTenantRoleDto>
}