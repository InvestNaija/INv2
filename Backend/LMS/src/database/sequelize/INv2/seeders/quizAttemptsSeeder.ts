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