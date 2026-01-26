export interface QuizDto {
    id?: string;
    lmsId: string;
    title: string;
    detail: string;
    startDate: Date;
    endDate: Date;
    isImmediateAnswer: boolean;
    userId?: string;
}

export interface GetQuizDto {
    id?: string;
    lmsId?: string;
    title?: string;
    userId?: string;
}