import { injectable } from "inversify";
import { Transaction } from "sequelize";
import { Repository, Sequelize as SequelizeTS } from "sequelize-typescript";
import { IQuestionRepository } from "../../../../business/repositories/IQuestionRepository";
import { Question } from "../../../../domain/sequelize/INv2/models/question.model";
import { getDbCxn } from "../../../../domain";

@injectable()
export class QuestionRepository implements IQuestionRepository {
    //instantiate the needed models
    get questionRepo(): Repository<Question> {
        const dbCxn = getDbCxn();
        // In tests, getDbCxn might be undefined, so use Question's sequelize instance
        if (dbCxn) {
            return dbCxn.getRepository(Question);
        }
        // Fallback to Question model's sequelize instance (for tests)
        // Cast to sequelize-typescript Sequelize which has getRepository method
        if (Question.sequelize) {
            return (Question.sequelize as unknown as SequelizeTS).getRepository(Question);
        }
        throw new Error('Database connection not available');
    }

    public async transaction(): Promise<Transaction> {
        const dbCxn = getDbCxn();
        if (dbCxn) {
            return await dbCxn.transaction();
        }
        // Fallback to Question model's sequelize instance (for tests)
        return await Question.sequelize!.transaction();
    }
    public async commit(t: Transaction): Promise<void> {
        await t.commit();
    }
    public async rollback(t: Transaction): Promise<void> {
        await t.rollback();
    }
    public async createQuestion(questionData: any, transaction?: Transaction): Promise<any> {
        const createQuestion = await this.questionRepo.create(questionData, { transaction });
        return createQuestion;
    }
    public async getQuestionById(id: string, transaction?: Transaction, includes?: any[]): Promise<any> {
        const question = await this.questionRepo.findByPk(id, { transaction, include: includes });
        return question;
    }
    public async getQuestions(filter: any, transaction?: Transaction): Promise<any[]> {
        const questions = await this.questionRepo.findAll({ where: filter, transaction });
        return questions;
    }
    public async updateQuestion(id: string, questionData: any, transaction?: Transaction): Promise<any> {
        const question = await this.questionRepo.findByPk(id, { transaction });
        if (question) {
            await question.update(questionData, { transaction });
            return question;
        }
        return null;
    }
    public async deleteQuestion(id: string, transaction?: Transaction): Promise<void> {
        const question = await this.questionRepo.findByPk(id, { transaction });
        if (question) {
            await question.destroy({ transaction });
        }
    }
}