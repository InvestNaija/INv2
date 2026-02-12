
// file types.ts
export const TYPES = {
   //Repositories
   IQuizRepository: Symbol.for("IQuizRepository"),
   ILmsRepository: Symbol.for("ILmsRepository"),
   IQuestionRepository: Symbol.for("IQuestionRepository"),

   //Services
   QuizService: Symbol.for("QuizService"),
   LmsService: Symbol.for("LmsService"),
   QuestionService: Symbol.for("QuestionService"),
};