import { SaveplanDto } from "../_dtos";
import { Subjects } from "./subjects";

export interface SaveplanCreatedEvent {
   subject: Subjects.SaveplanCreated;
   data: Partial<SaveplanDto>
}