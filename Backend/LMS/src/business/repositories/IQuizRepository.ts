import { Transaction } from "sequelize";

export interface IQuizRepository {
    transaction(): Promise<Transaction>;
    commit(t: Transaction): Promise<void>;
    rollback(t: Transaction): Promise<void>;
    createQuiz(quizData: any, transaction?: Transaction): Promise<any>;
    getQuizById(id: string, transaction?: Transaction, includes?: any[]): Promise<any>;
    getQuizzes(filter: any, transaction?: Transaction): Promise<any[]>;
    updateQuiz(id: string, quizData: any, transaction?: Transaction): Promise<any>;
    deleteQuiz(id: string, transaction?: Transaction): Promise<void>;
}