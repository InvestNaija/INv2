import { Transaction } from "sequelize";

export interface IQuestionRepository {
    transaction(): Promise<Transaction>;
    commit(t: Transaction): Promise<void>;
    rollback(t: Transaction): Promise<void>;
    createQuestion(questionData: any, transaction?: Transaction): Promise<any>;
    getQuestionById(id: string, transaction?: Transaction, includes?: any[]): Promise<any>;
    getQuestions(filter: any, transaction?: Transaction): Promise<any[]>;
    updateQuestion(id: string, questionData: any, transaction?: Transaction): Promise<any>;
    deleteQuestion(id: string, transaction?: Transaction): Promise<void>;
}