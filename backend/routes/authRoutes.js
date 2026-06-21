import express from 'express';
import { registerUser, loginUser, getUserProfile, logoutUser, refreshToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../validations/validate.js';
import { registerValidationRules, loginValidationRules } from '../validations/authValidation.js';

const router = express.Router();

router.post('/register', registerValidationRules(), validate, registerUser);
router.post('/login', loginValidationRules(), validate, loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.get('/profile', protect, getUserProfile);

export default router;
