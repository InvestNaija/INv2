export declare class QuestionDto {
   id: string;
   quizId: string;
   userId: string;
   title: string;
   details: string;
   type: number | string;
   version: number;
   createdAt: Date;
   updatedAt: Date;
}

export declare class CreateQuestionDto {
   quizId: string;
   title: string;
   details: string;
   type: number | string;
}

export declare class UpdateQuestionDto {
   title?: string;
   details?: string;
   type?: number | string;
}
