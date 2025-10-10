import { Subjects } from "./subjects";
import { SaveplanDto } from "../_dtos";

export interface SaveplanUpdatedEvent {
   subject: Subjects.SaveplanUpdated;
   data: Partial<SaveplanDto>
} 