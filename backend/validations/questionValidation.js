import { body } from 'express-validator';

export const questionValidationRules = () => {
  return [
    body('text').notEmpty().withMessage('Question text is required'),
    body('difficulty')
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard'),
    body('category').notEmpty().withMessage('Category is required'),
    body('options')
      .isArray({ min: 2, max: 6 })
      .withMessage('Question must have between 2 and 6 options'),
    body('options.*.text').notEmpty().withMessage('Option text is required'),
    body('options.*.isCorrect').isBoolean().withMessage('Option isCorrect must be a boolean')
  ];
};
