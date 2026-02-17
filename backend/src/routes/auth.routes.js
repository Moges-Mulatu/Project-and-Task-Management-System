import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import AuthValidator from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validate(AuthValidator.register), AuthController.register);
router.post('/login', validate(AuthValidator.login), AuthController.login);

export default router;
