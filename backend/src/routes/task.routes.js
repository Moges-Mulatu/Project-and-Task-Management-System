import express from 'express';
import TaskController from '../controllers/task.controller.js';
import TaskValidator from '../validators/task.validator.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateUUID } from '../middlewares/paramValidator.middleware.js';
import { ROLES } from '../constants/roles.constants.js';

const router = express.Router();

// All task routes are protected
router.use(protect);

// Basic CRUD
router.get('/', TaskController.getAll);
// Task creation - PM only
router.post('/', restrictTo(ROLES.PROJECT_MANAGER), validate(TaskValidator.create), TaskController.create);

// Task updates - PM and team members can update
router.patch('/:id', validateUUID('id'), validate(TaskValidator.update), TaskController.update);

// Task deletion - PM only
router.delete('/:id', validateUUID('id'), restrictTo(ROLES.PROJECT_MANAGER), TaskController.delete);

// Collaboration items
router.post('/:id/comments', validateUUID('id'), validate(TaskValidator.addComment), TaskController.addComment);
router.post('/:id/attachments', validateUUID('id'), validate(TaskValidator.addAttachment), TaskController.addAttachment);

export default router;
