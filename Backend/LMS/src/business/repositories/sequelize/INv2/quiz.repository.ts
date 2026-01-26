import { injectable } from "inversify";
import { Transaction } from "sequelize";
import { Repository, Sequelize as SequelizeTS } from "sequelize-typescript";
import { IQuizRepository } from "../../IQuizRepository";
import { Quiz } from "../../../../domain/sequelize/INv2/models/quiz.model";
import { getDbCxn } from "../../../../domain";

@injectable()
export class QuizRepository implements IQuizRepository {
    //instantiate the needed models
    get quizRepo(): Repository<Quiz> { 
        const dbCxn = getDbCxn();
        // In tests, getDbCxn might be undefined, so use Quiz's sequelize instance
        if (dbCxn) {
            return dbCxn.getRepository(Quiz);
        }
        // Fallback to Quiz model's sequelize instance (for tests)
        // Cast to sequelize-typescript Sequelize which has getRepository method
        if (Quiz.sequelize) {
            return (Quiz.sequelize as unknown as SequelizeTS).getRepository(Quiz);
        }
        throw new Error('Database connection not available');
    }

    public async transaction(): Promise<Transaction> {
        const dbCxn = getDbCxn();
        if (dbCxn) {
            return await dbCxn.transaction();
        }
        // Fallback to Quiz model's sequelize instance (for tests)
        return await Quiz.sequelize!.transaction();
    }
    public async commit(t: Transaction): Promise<void> {
        await t.commit();
    }
    public async rollback(t: Transaction): Promise<void> {
        await t.rollback();
    }
    public async createQuiz(quizData: any, transaction?: Transaction): Promise<any> {
        const createQuiz = await this.quizRepo.create(quizData, { transaction });
        return createQuiz;
    }
    public async getQuizById(id: string, transaction?: Transaction, includes?: any[]): Promise<any> {
        const quiz = await this.quizRepo.findByPk(id, { transaction, include: includes });
        return quiz;
    }
    public async getQuizzes(filter: any, transaction?: Transaction): Promise<any[]> {
        const quizzes = await this.quizRepo.findAll({ where: filter, transaction });
        return quizzes;
    }
    public async updateQuiz(id: string, quizData: any, transaction?: Transaction): Promise<any> {
        const quiz = await this.quizRepo.findByPk(id, { transaction });
        if (quiz) {
            await quiz.update(quizData, { transaction });
            return quiz;
        }
        return null;
    }
    public async deleteQuiz(id: string, transaction?: Transaction): Promise<void> {
        const quiz = await this.quizRepo.findByPk(id, { transaction });
        if (quiz) {
            await quiz.destroy({ transaction });
        }
    }
}