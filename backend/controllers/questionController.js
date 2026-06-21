import { getAllQuestions, getQuestionById, createQuestion, updateQuestion, deleteQuestion, addQuestionOption, getQuestionOptions } from '../models/Question.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import pool from '../config/db.js';

export const getQuestions = async (req, res, next) => {
  try {
    const questions = await getAllQuestions();
    for (let q of questions) {
      q.options = await getQuestionOptions(q.id);
    }
    res.json(new ApiResponse(200, questions, "Questions fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const addQuestion = async (req, res, next) => {
  const { text, difficulty, category, options } = req.body;
  try {
    const questionId = await createQuestion(text, difficulty, category);
    for (const opt of options) {
      await addQuestionOption(questionId, opt.text, opt.isCorrect);
    }
    res.status(201).json(new ApiResponse(201, { questionId }, 'Question created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateQuestionById = async (req, res, next) => {
  try {
    res.json(new ApiResponse(200, null, 'Question updated'));
  } catch (error) {
    next(error);
  }
};

export const removeQuestion = async (req, res, next) => {
  try {
    await deleteQuestion(req.params.id);
    res.json(new ApiResponse(200, null, 'Question deleted'));
  } catch (error) {
    next(error);
  }
};

export const getRandomQuestion = async (req, res, next) => {
  try {
    const { difficulty } = req.query;
    if (!difficulty) {
      throw new ApiError(400, 'Difficulty query parameter is required');
    }

    const [questions] = await pool.execute(
      'SELECT * FROM questions WHERE difficulty = ? ORDER BY RAND() LIMIT 1',
      [difficulty]
    );

    if (questions.length === 0) {
      throw new ApiError(404, `No questions found for difficulty: ${difficulty}`);
    }

    const question = questions[0];
    question.options = await getQuestionOptions(question.id);

    res.json(new ApiResponse(200, question, "Random question fetched successfully"));
  } catch (error) {
    next(error);
  }
};
