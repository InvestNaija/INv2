import { Subjects } from './subjects';
export interface OfferingCreatedEvent {
   subject: Subjects.OfferingCreated;
   data: {
      id: string;
      name: string;
      offerPrice: number;
      currency?: string;
   };
}
