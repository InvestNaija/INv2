export class DBEnums {
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
         {code: 100, label: 'pending'}, 
         {code: 101, label: 'failed'},
         {code: 102, label: 'cancelled'},
         {code: 103, label: 'success',},
         {code: 104, label: 'inprogress',},
         {code: 105, label: 'done'},
         {code: 106, label: 'completed'},
      ]
   }
}