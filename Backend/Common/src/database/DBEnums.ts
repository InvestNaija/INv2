export class DBEnums {
   static get Currency() {
      return [
         {code: 101, name: 'NGN', label: 'Nigerian Naira'}, 
         {code: 102, name: 'USD', label: 'US Dollars'}, 
         {code: 103, name: 'GBP', label: 'British Pounds'},
      ];
   };
   static get MediaType() {
      return [
         {code: 101, name: 'avatar', label: 'Avatar'}, 
         {code: 102, name: 'logo', label: 'Logo'}, 
         {code: 103, name: 'logo', label: 'Logo'}, 
         {code: 104, name: 'banner', label: 'Banner'}, 
         {code: 105, name: 'offer-documents', label: 'Offer Documents'},
         {code: 106, name: 'pop', label: 'Proof of Payment'},
      ];
   };
   static get UserGender(){
      return [
         {code: 101, name: 'male', label: 'Male'}, 
         {code: 102, name: 'female', label: 'Female',},
         {code: 120, name: 'other', label: 'Other'},
      ];
   };
   static get NOKRelationships() {
      return [
         {code: 101, name: "mother", label: "Mother"},
         {code: 102, name: "father", label: "Father"},
         {code: 103, name: "husband", label: "Husband"},
         {code: 104, name: "wife", label: "Wife"},
         {code: 105, name: "son", label: "Son"},
         {code: 106, name: "daughter", label: "Daughter"},
         {code: 107, name: "brother", label: "Brother"},
         {code: 108, name: "sister", label: "Sister"},
         {code: 109, name: "friend", label: "Friend"},
         {code: 110, name: "partner", label: "Partner"},
         {code: 111, name: "manager", label: "Manager"},
         {code: 130, name: "other", label: "Other"},
      ];
   };
   static get TenantType(){
      return [
         {code: 101, name: 'SA', label: 'Super Admin'}, 
         {code: 105, name: 'business', label: 'Business'}, 
         {code: 110, name: 'bank', label: 'Bank',},
         {code: 150, name: 'other', label: 'Other'},
      ];
   };
   static get SaveplanType(){
      return [
         {code: 101, name: 'savein', label: 'SaveIN'}, 
         {code: 105, name: 'planin', label: 'PlanIN'},
         {code: 105, name: 'custom', label: 'Custom'},
      ];
   };
   static get SaveplanCalculatorType(){
      return [
         {code: 101, name: 'savein', label: 'SaveIN Calculator'}, 
         {code: 105, name: 'planin', label: 'PlanIN Calculator'},
      ];
   };
   static get LMSType(){
      return [
         {code: 101, name: 'art', label: 'Articles'}, 
         {code: 105, name: 'pod', label: 'Podcast'}, 
         {code: 110, name: 'eps', label: 'Episode'}, 
         {code: 115, name: 'vid', label: 'Video',},
         {code: 120, name: 'qz', label: 'Quiz',},
         {code: 125, name: 'rsh', label: 'Research',},
         {code: 130, name: 'ch', label: 'Chapter',},
         {code: 135, name: 'crs', label: 'Course',},
      ];
   };  
   static get QuestionType(){
      return [
         {code: 101, name: 'yn', label: 'Yes/No'}, 
         {code: 105, name: 'mcsa', label: 'MultiChoice-SingleAnswer'}, 
         {code: 110, name: 'mcma', label: 'Multi Choice-MultiAnswer'}, 
         {code: 115, name: 'mtc', label: 'Match The Column',},
         {code: 120, name: 'sa', label: 'Short Answer',},
         {code: 125, name: 'la', label: 'Long Answer',},
      ];
   };
   static get OrderStatus() {
      return [
         {code: 100, name: 'pending', label: 'pending'}, 
         {code: 101, name: 'failed', label: 'failed'},
         {code: 102, name: 'cancelled', label: 'cancelled'},
         {code: 103, name: 'success', label: 'success',},
         {code: 104, name: 'inprogress', label: 'inprogress',},
         {code: 105, name: 'done', label: 'done',},
         {code: 106, name: 'completed', label: 'completed'},
      ];
   }
   static get PmtType() {
      return [
         {code: 105, name: 'credit', label: 'Credit'}, 
         {code: 110, name: 'debit', label: 'Debit'}, 
         {code: 115, name: 'charge', label: 'Charge',},
         {code: 120, name: 'interest', label: 'Interest',},
      ];
   }
   static get GatewayType() {
      return [
         {code: 100, name: 'bank', label: 'Bank'}, 
         {code: 105, name: 'card', label: 'Card'}, 
         {code: 110, name: 'pwt', label: 'Pay With Transfer'},
      ];
   }
}