export interface CreateAttemptAnswerDto {
    quizAttemptId: string;
    questionId: string;
    answerGiven: string;
    answerScore: number;
}

export interface UpdateAttemptAnswerDto {
    answerGiven?: string;
    answerScore?: number;
}

export interface GetAttemptAnswerDto {
    id?: string;
    quizAttemptId?: string;
    questionId?: string;
}
