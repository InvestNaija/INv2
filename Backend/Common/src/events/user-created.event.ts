import { CreateUserDto } from "../_dtos";
import { Subjects } from "./subjects";

export interface UserCreatedEvent {
   subject: Subjects.UserCreated;
   data: CreateUserDto
}