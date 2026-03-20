import { Subjects } from './subjects';
export interface OfferingUpdatedEvent {
   subject: Subjects.OfferingUpdated;
   data: {
      id: string;
      name?: string;
      offerPrice?: number;
      currency?: string;
   };
}
