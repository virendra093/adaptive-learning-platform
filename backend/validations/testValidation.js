import { body } from 'express-validator';

export const submitTestValidationRules = () => {
  return [
    body('testId').notEmpty().withMessage('Test ID is required').isInt().withMessage('Test ID must be an integer'),
    body('responses').isArray({ min: 1 }).withMessage('Responses must be a non-empty array'),
    body('responses.*.questionId').isInt().withMessage('Question ID must be an integer'),
    body('responses.*.optionId').isInt().withMessage('Option ID must be an integer'),
    body('responses.*.responseTimeMs').isInt({ min: 0 }).withMessage('Response time must be a positive integer'),
    body('responses.*.isCorrect').isBoolean().withMessage('isCorrect must be a boolean')
  ];
};
