import express from 'express';
import { getQuestions, addQuestion, updateQuestionById, removeQuestion, getRandomQuestion } from '../controllers/questionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validate } from '../validations/validate.js';
import { questionValidationRules } from '../validations/questionValidation.js';

const router = express.Router();

router.get('/', protect, getQuestions);
router.get('/random', protect, getRandomQuestion);
router.post('/', protect, admin, questionValidationRules(), validate, addQuestion);
router.put('/:id', protect, admin, updateQuestionById);
router.delete('/:id', protect, admin, removeQuestion);

export default router;
