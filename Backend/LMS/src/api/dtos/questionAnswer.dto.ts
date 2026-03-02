export interface CreateQuestionAnswerDto {
    questionId: string;
    answer: string;
    details?: string;
    isValid: boolean;
}

export interface UpdateQuestionAnswerDto {
    answer?: string;
    details?: string;
    isValid?: boolean;
}

export interface GetQuestionAnswerDto {
    id?: string;
    questionId?: string;
}
