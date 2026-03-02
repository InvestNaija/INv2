export interface CreateQuizAttemptDto {
    quizId: string;
    attemptIp: string;
}

export interface UpdateQuizAttemptDto {
    attemptEnd?: Date;
    attemptIp?: string;
}

export interface GetQuizAttemptDto {
    id?: string;
    quizId?: string;
    userId?: string;
}
