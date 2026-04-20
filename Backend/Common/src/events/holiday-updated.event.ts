import { Subjects } from "./subjects";

import { HolidayEventInfo } from "./holiday-created.event";

export interface HolidayUpdatedEvent {
   subject: Subjects.HolidayUpdated;
   data: HolidayEventInfo;
}
