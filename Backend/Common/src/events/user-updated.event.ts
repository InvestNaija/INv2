import { Subjects } from "./subjects";
import { CreateUserDto } from "../_dtos";

export interface UserUpdatedEvent {
   subject: Subjects.UserUpdated;
   data: CreateUserDto;
}