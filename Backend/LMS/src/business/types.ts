
// file types.ts
export const TYPES = {
   //Repositories
   IQuizRepository: Symbol.for("IQuizRepository"),
   ILmsRepository: Symbol.for("ILmsRepository"),
   
   //Services
   QuizService:  Symbol.for("QuizService"),
   LmsService:  Symbol.for("LmsService"),
};