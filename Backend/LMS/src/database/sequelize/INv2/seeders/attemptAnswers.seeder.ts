import { version } from 'os';
import { v4 as uuidv4 } from 'uuid';
export const lmsId = uuidv4(), lmsQuizId = uuidv4(), quizQuestionId = uuidv4(), questionId = uuidv4()

export const lms = [
   { 
      id: lmsId, 
      p_id: null,
      title: 'Understanding Real Estate Investments',
      type: 135, // Course
      summary: 'A comprehensive guide to real estate investing.',
      content: 'This course covers strategies, risks, and rewards of real estate investment.',
      price: 5000.00,
      created_at: new Date(),
      updated_at: new Date()
   }
]

export const quizzes = [
   {
      id: lmsQuizId,
      title: `Understanding Real Estate Investments`,
      detail: `To Test Your Knowledge`
   }
]

export const questions = [
   {
      id: questionId,
      title: 'Test Question',
      details: 'just for testing',
      type: 110
   }
]

export const quiz_questions = [
   {
      version: 0,
      id: quizQuestionId,
      order: 1
   }
]

export const quiz_attempts = [
    {
        id: uuidv4(),
        quizId: lmsQuizId,
        userId: '087e7b7f-bf68-4d63-907b-9a9374a89420',
    }
]

export const quiz_attempt_answers = [
    {
        id: uuidv4(),
        quizAttemptId: quiz_attempts[0].id,
        questionId: questionId,
        answerGiven: 'Test Answer',
        answerScore: 1,
        version: 0
    }
]