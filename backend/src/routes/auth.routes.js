import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import AuthValidator from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authRateLimiter, validate(AuthValidator.register), AuthController.register);
router.post('/login', authRateLimiter, validate(AuthValidator.login), AuthController.login);

export default router;
