import { Subjects } from "./subjects";

import { HolidayEventInfo } from "./holiday-created.event";

export interface HolidayDeletedEvent {
   subject: Subjects.HolidayDeleted;
   data: HolidayEventInfo;
}
