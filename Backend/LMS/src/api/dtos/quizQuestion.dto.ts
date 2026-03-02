export interface CreateQuizQuestionDto {
    quizId: string;
    questionId: string;
    userId?: string;
    passScore: number;
    failScore: number;
    order: number;
}

export interface UpdateQuizQuestionDto {
    passScore?: number;
    failScore?: number;
    order?: number;
}

export interface GetQuizQuestionDto {
    id?: string;
    quizId?: string;
    questionId?: string;
}
