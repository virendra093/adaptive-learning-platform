import express from 'express';
import { startTest, submitTest, getResult, evaluateAdaptive, generateGeneralTest, generateAdaptiveTest } from '../controllers/testController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../validations/validate.js';
import { submitTestValidationRules } from '../validations/testValidation.js';

const router = express.Router();

router.post('/start', protect, startTest);
router.get('/generate/general', protect, generateGeneralTest);
router.get('/generate/adaptive', protect, generateAdaptiveTest);
router.post('/adaptive-eval', protect, evaluateAdaptive);
router.post('/submit', protect, submitTestValidationRules(), validate, submitTest);
router.get('/result/:id', protect, getResult);

export default router;
